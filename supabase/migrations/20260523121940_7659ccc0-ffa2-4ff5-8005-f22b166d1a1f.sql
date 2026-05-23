-- Onboarding fixed course
INSERT INTO public.courses (id, title, description, thumbnail_url, published)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Como usar o Vaga Certa',
  'Aprenda a usar todas as ferramentas do Vaga Certa para acelerar sua recolocação profissional.',
  NULL,
  true
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  published = EXCLUDED.published;

INSERT INTO public.modules (id, course_id, title, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Primeiros passos',
  0
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO public.lessons (id, module_id, title, video_url, sort_order)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Tour completo pelo app',
  NULL,
  0
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Certificates table for resume
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  year TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own certificates" ON public.certificates
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);