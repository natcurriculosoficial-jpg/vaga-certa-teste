import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Home, Flame, Star, FileText, MessageCircle,
  Search, Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityPosts, FeedFilter } from "@/hooks/useCommunityPosts";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CreatePost from "@/components/community/CreatePost";
import PostCard from "@/components/community/PostCard";
import UserProfileSheet from "@/components/community/UserProfileSheet";

interface Topic { id: string; name: string; emoji: string | null; sort_order: number; }

const SIDEBAR_FILTERS: { id: FeedFilter; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "Feed geral", icon: Home },
  { id: "trending", label: "Em alta", icon: Flame },
  { id: "favorites", label: "Favoritos", icon: Star },
  { id: "mine", label: "Meus posts", icon: FileText },
  { id: "interactions", label: "Minhas interações", icon: MessageCircle },
];

export default function Community() {
  const { posts, loading, filter, setFilter, topicFilter, setTopicFilter, hasMore, loadMore, toggleLike, toggleFavorite, refetch } = useCommunityPosts();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("community_topics").select("*").order("sort_order").then(({ data }) => {
      setTopics(data || []);
    });
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) loadMore();
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  const openProfile = (userId: string) => {
    setProfileUserId(userId);
    setProfileOpen(true);
  };

  const filteredPosts = searchQuery
    ? posts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hashtags?.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex gap-6">
        {/* Left sidebar — desktop only */}
        <aside className="hidden lg:block w-[220px] shrink-0 space-y-6 sticky top-20 self-start">
          <div className="space-y-1">
            {SIDEBAR_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setTopicFilter(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filter === f.id && !topicFilter ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <f.icon className="h-4 w-4" />
                {f.label}
              </button>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">📂 Tópicos</p>
            <div className="space-y-0.5">
              {topics.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTopicFilter(t.id); setFilter("all"); }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    topicFilter === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main feed */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Comunidade
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Conecte-se, compartilhe vagas e dicas de carreira</p>
          </div>

          {/* Mobile filter pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SIDEBAR_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setTopicFilter(null); }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f.id && !topicFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <CreatePost topics={topics} onCreated={refetch} />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar posts, pessoas ou hashtags..."
              className="pl-9 bg-muted/40 h-9 text-sm"
            />
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum post encontrado. Seja o primeiro!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(p => (
                <PostCard
                  key={p.id}
                  post={p}
                  onLike={toggleLike}
                  onFavorite={toggleFavorite}
                  onAuthorClick={openProfile}
                />
              ))}
              <div ref={sentinelRef} className="h-4" />
              {!hasMore && posts.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">Você chegou ao fim 🎉</p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar — desktop only */}
        <aside className="hidden xl:block w-[280px] shrink-0 space-y-6 sticky top-20 self-start">
          {/* Trending hashtags */}
          <div className="vc-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground">🔥 Hashtags em alta</h3>
            <div className="flex flex-wrap gap-1.5">
              {["vagas", "remoto", "entrevista", "currículo", "dicas", "tech", "rh", "networking"].map(h => (
                <button
                  key={h}
                  onClick={() => setSearchQuery(`#${h}`)}
                  className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  #{h}
                </button>
              ))}
            </div>
          </div>

          {/* Topic quick filters */}
          <div className="vc-card space-y-3">
            <h3 className="text-sm font-semibold text-foreground">📂 Tópicos</h3>
            <div className="space-y-1">
              {topics.slice(0, 5).map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTopicFilter(t.id); setFilter("all"); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <span>{t.emoji}</span> {t.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <UserProfileSheet userId={profileUserId} open={profileOpen} onClose={() => setProfileOpen(false)} />
    </motion.div>
  );
}
