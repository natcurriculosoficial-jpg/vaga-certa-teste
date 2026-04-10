import { useState, useEffect } from "react";
import { Send, Heart, CornerDownRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  liked?: boolean;
  replies?: Comment[];
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function CommentsSection({ postId }: { postId: string }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    const { data: raw } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!raw) { setLoading(false); return; }

    const userIds = [...new Set(raw.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", userIds);
    const pMap: Record<string, any> = {};
    profiles?.forEach(p => { pMap[p.user_id] = p; });

    // user likes
    let likedSet = new Set<string>();
    if (userId) {
      const { data: likes } = await supabase
        .from("community_comment_likes")
        .select("comment_id")
        .eq("user_id", userId)
        .in("comment_id", raw.map(c => c.id));
      likes?.forEach(l => likedSet.add(l.comment_id));
    }

    const enriched: Comment[] = raw.map(c => ({
      ...c,
      author_name: pMap[c.user_id]?.name || "Usuário",
      author_avatar: pMap[c.user_id]?.avatar_url || null,
      liked: likedSet.has(c.id),
      replies: [],
    }));

    // nest replies
    const topLevel: Comment[] = [];
    const replyMap: Record<string, Comment[]> = {};
    enriched.forEach(c => {
      if (c.parent_id) {
        if (!replyMap[c.parent_id]) replyMap[c.parent_id] = [];
        replyMap[c.parent_id].push(c);
      } else {
        topLevel.push(c);
      }
    });
    topLevel.forEach(c => { c.replies = replyMap[c.id] || []; });

    setComments(topLevel);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const submit = async (parentId: string | null, text: string) => {
    if (!text.trim() || !userId) return;
    setSubmitting(true);
    await supabase.from("community_comments").insert({
      user_id: userId,
      post_id: postId,
      parent_id: parentId,
      content: text.trim(),
    });
    setNewComment("");
    setReplyTo(null);
    setReplyText("");
    await fetchComments();
    setSubmitting(false);
  };

  const toggleLike = async (commentId: string) => {
    if (!userId) return;
    const c = comments.find(x => x.id === commentId) || comments.flatMap(x => x.replies || []).find(x => x.id === commentId);
    if (!c) return;
    if (c.liked) {
      await supabase.from("community_comment_likes").delete().eq("user_id", userId).eq("comment_id", commentId);
    } else {
      await supabase.from("community_comment_likes").insert({ user_id: userId, comment_id: commentId });
    }
    fetchComments();
  };

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const renderComment = (c: Comment, isReply = false) => (
    <div key={c.id} className={`flex gap-2 ${isReply ? "ml-8" : ""}`}>
      {c.author_avatar ? (
        <img src={c.author_avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{initials(c.author_name)}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
        </div>
        <p className="text-xs text-foreground/80 mt-0.5">{c.content}</p>
        <div className="flex items-center gap-3 mt-1">
          <button onClick={() => toggleLike(c.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500">
            <Heart className={`h-3 w-3 ${c.liked ? "fill-red-500 text-red-500" : ""}`} />
            {c.likes_count > 0 && c.likes_count}
          </button>
          {!isReply && (
            <button onClick={() => setReplyTo(c.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
              <CornerDownRight className="h-3 w-3" /> Responder
            </button>
          )}
        </div>
        {replyTo === c.id && (
          <div className="flex gap-2 mt-2">
            <Input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Escreva uma resposta..."
              className="h-7 text-xs bg-muted/40"
              onKeyDown={e => e.key === "Enter" && submit(c.id, replyText)}
            />
            <button
              onClick={() => submit(c.id, replyText)}
              disabled={submitting}
              className="text-primary hover:text-primary/80"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {c.replies?.map(r => renderComment(r, true))}
      </div>
    </div>
  );

  if (loading) return <div className="space-y-2 pt-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>;

  return (
    <div className="space-y-3 pt-2 border-t border-border/50">
      {/* New comment input */}
      <div className="flex gap-2">
        <Input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="h-8 text-xs bg-muted/40"
          onKeyDown={e => e.key === "Enter" && submit(null, newComment)}
        />
        <button
          onClick={() => submit(null, newComment)}
          disabled={submitting || !newComment.trim()}
          className="text-primary hover:text-primary/80 disabled:opacity-40"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Nenhum comentário ainda</p>
      ) : (
        <div className="space-y-3">{comments.map(c => renderComment(c))}</div>
      )}
    </div>
  );
}
