import { useState, useEffect, useRef } from "react";
import { ImageIcon, Hash, Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Topic { id: string; name: string; emoji: string | null; }

export default function CreatePost({ topics, onCreated }: { topics: Topic[]; onCreated: () => void }) {
  const { user: profile, session } = useAuth();
  const [content, setContent] = useState("");
  const [topicId, setTopicId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-save draft
  useEffect(() => {
    const saved = localStorage.getItem("community_draft");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.content) setContent(d.content);
        if (d.topicId) setTopicId(d.topicId);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      localStorage.setItem("community_draft", JSON.stringify({ content, topicId }));
    }, 2000);
  }, [content, topicId]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast({ title: "Imagem muito grande (máx 5MB)", variant: "destructive" }); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handlePost = async () => {
    if (!content.trim() || !topicId || !session?.user) return;
    setPosting(true);

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("community").upload(path, imageFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("community").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }

      // Extract hashtags
      const hashtags = (content.match(/#\w+/g) || []).map(h => h.slice(1));

      const { error } = await supabase.from("community_posts").insert({
        user_id: session.user.id,
        topic_id: topicId,
        content: content.trim(),
        image_url: imageUrl,
        hashtags,
      });
      if (error) throw error;

      // Auto-complete checklist
      await supabase.from("checklist_progress").upsert({
        user_id: session.user.id,
        item_key: "engage_community",
        completed: true,
        completed_at: new Date().toISOString(),
      });

      setContent("");
      setTopicId("");
      setImageFile(null);
      setImagePreview(null);
      localStorage.removeItem("community_draft");
      toast({ title: "✅ Post publicado!" });
      onCreated();
    } catch (e: any) {
      toast({ title: "Erro ao publicar", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const initials = (profile?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="vc-card space-y-3">
      <div className="flex gap-3">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
        )}
        <Textarea
          ref={textRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Compartilhe uma vaga, dica ou dúvida..."
          className="bg-muted/40 min-h-[80px] text-sm resize-none flex-1"
        />
      </div>

      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="" className="max-h-40 rounded-lg" />
          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <label className="cursor-pointer p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <ImageIcon className="h-4 w-4" />
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </label>
        <button
          onClick={() => { setContent(c => c + " #"); textRef.current?.focus(); }}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Hash className="h-4 w-4" />
        </button>

        <Select value={topicId} onValueChange={setTopicId}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/40">
            <SelectValue placeholder="Selecionar tópico" />
          </SelectTrigger>
          <SelectContent>
            {topics.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.emoji} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />
        <Button
          onClick={handlePost}
          disabled={!content.trim() || !topicId || posting}
          size="sm"
          className="gradient-primary text-white"
        >
          {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
          Publicar
        </Button>
      </div>
    </div>
  );
}
