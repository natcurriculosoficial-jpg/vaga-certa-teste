import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Star, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CommunityPost } from "@/hooks/useCommunityPosts";
import CommentsSection from "./CommentsSection";

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)}m`;
  if (s < 86400) return `há ${Math.floor(s / 3600)}h`;
  return `há ${Math.floor(s / 86400)}d`;
}

export default function PostCard({
  post,
  onLike,
  onFavorite,
  onAuthorClick,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onAuthorClick: (userId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const isLong = post.content.length > 280;
  const initials = (post.author_name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const share = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`);
    toast({ title: "🔗 Link copiado!" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="vc-card space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => onAuthorClick(post.user_id)} className="shrink-0">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{initials}</div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => onAuthorClick(post.user_id)} className="text-sm font-semibold text-foreground hover:underline">
              {post.author_name}
            </button>
            {post.author_role && <span className="text-xs text-muted-foreground">· {post.author_role}</span>}
            {post.author_level && <span className="text-xs text-muted-foreground">· {post.author_level}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            {post.topic_name && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {post.topic_emoji} {post.topic_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {isLong && !expanded ? (
          <>
            {post.content.slice(0, 280)}...{" "}
            <button onClick={() => setExpanded(true)} className="text-primary text-xs font-medium">ver mais</button>
          </>
        ) : post.content}
      </div>

      {post.image_url && (
        <img src={post.image_url} alt="" className="rounded-xl max-h-80 w-full object-cover" />
      )}

      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map(h => (
            <span key={h} className="text-xs text-primary font-medium cursor-pointer hover:underline">#{h}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-border/50">
        <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500 text-red-500" : ""}`} />
          </motion.div>
          {post.likes_count > 0 && post.likes_count}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="h-4 w-4" />
          {post.comments_count > 0 && post.comments_count}
        </button>
        <button onClick={() => onFavorite(post.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-yellow-500 transition-colors">
          <motion.div whileTap={{ scale: 1.3 }}>
            <Star className={`h-4 w-4 ${post.favorited ? "fill-yellow-500 text-yellow-500" : ""}`} />
          </motion.div>
          {post.favorites_count > 0 && post.favorites_count}
        </button>
        <button onClick={share} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
          <Link2 className="h-4 w-4" />
        </button>
      </div>

      {showComments && <CommentsSection postId={post.id} />}
    </motion.div>
  );
}
