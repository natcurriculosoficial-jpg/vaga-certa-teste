# Migrar `profiles.id` para ser igual a `auth.users.id`

Hoje `profiles` tem duas colunas de identidade: `id` (UUID aleatório) e `user_id` (referência ao usuário do auth). RLS e todo o código usam `user_id`. Vamos eliminar `user_id` e fazer `id = auth.users.id`.

**Importante:** apenas a tabela `profiles` muda. As outras tabelas (`experiences`, `saved_jobs`, `community_posts`, `community_likes`, etc.) continuam usando a coluna `user_id` apontando para `auth.users.id` — não há motivo para mexer nelas e isso evita um refator gigante.

## 1. Migration SQL (schema)

```sql
-- Remover trigger antigo enquanto migramos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover policies que dependem de user_id
DROP POLICY "Users can insert their own profile" ON public.profiles;
DROP POLICY "Users can update their own profile" ON public.profiles;
DROP POLICY "Users can view their own profile"   ON public.profiles;

-- Apagar profiles órfãos (id != user_id e sem auth user correspondente)
-- e alinhar id = user_id
UPDATE public.profiles SET id = user_id WHERE id <> user_id;

-- Remover default aleatório e dropar user_id
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profiles DROP COLUMN user_id;

-- Recriar policies usando id
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Recriar função/trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'name', ''),
          COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

`types.ts` será regenerado automaticamente após a migration.

## 2. Mudanças de código

**`src/hooks/useAuth.ts`**
- Interface `Profile`: remover `user_id`.
- `fetchProfile`: `.eq("id", userId)`.
- `signup`: `.update(...).eq("id", data.user.id)`.
- `updateProfile`: `.update(...).eq("id", session.user.id)`.

**`src/components/community/UserProfileSheet.tsx`**
- Select `.from("profiles").select("id, name, avatar_url, ...").eq("id", userId)`.
- Tipo `UserProfile`: trocar `user_id` por `id`.

**`src/hooks/useCommunityPosts.ts`**
- `.from("profiles").select("id, name, avatar_url, target_role, level, area").in("id", userIds)`.
- `profileMap[p.id] = p`.

**`src/components/community/CommentsSection.tsx`**
- Mesma troca: `select("id, ...").in("id", userIds)` e `profileMap[p.id]`.

**`src/pages/Resume.tsx`**
- `.from("profiles").update({...}).eq("id", user.id)` (em vez de `user.user_id`).

Outros arquivos (`Dashboard`, `Settings`, `JobRadar`, `PixModal`, etc.) usam `user_id` em **outras tabelas** ligadas a `authUser.id` — permanecem inalterados.

## 3. Validação pós-implementação

1. Confirmar tipos regenerados: `Profile.id` presente, `user_id` ausente.
2. Login → carrega profile (sem 0 rows).
3. Signup novo usuário → trigger cria row em `profiles` com id = auth.uid.
4. Editar perfil em `/profile` e `/resume` salva sem erro RLS.
5. Comunidade: posts e comentários exibem nome/avatar do autor.
6. UserProfileSheet abre perfil de outro usuário corretamente.
