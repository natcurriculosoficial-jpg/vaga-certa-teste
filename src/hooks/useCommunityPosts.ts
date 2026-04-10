import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CommunityPost {
  id: string;
  user_id: string;
  topic_id: string | null;
  content: string;
  image_url: string | null;
  hashtags: string[];
  likes_count: number;
  favorites_count: number;
  comments_count: number;
  created_at: string;
  // joined
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
  author_level?: string;
  author_area?: string;
  topic_name?: string;
  topic_emoji?: string;
  // user state
  liked?: boolean;
  favorited?: boolean;
}

export type FeedFilter = "all" | "trending" | "favorites" | "mine" | "interactions";

export function useCommunityPosts() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 15;

  const fetchPosts = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (reset) { setPage(0); setHasMore(true); }

    let query = supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (topicFilter) query = query.eq("topic_id", topicFilter);
    if (filter === "mine" && userId) query = query.eq("user_id", userId);

    const { data: rawPosts } = await query;
    if (!rawPosts || rawPosts.length < PAGE_SIZE) setHasMore(false);
    if (!rawPosts) { setLoading(false); return; }

    // fetch author profiles
    const userIds = [...new Set(rawPosts.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url, target_role, level, area")
      .in("user_id", userIds);

    const profileMap: Record<string, any> = {};
    profiles?.forEach(p => { profileMap[p.user_id] = p; });

    // fetch topics
    const topicIds = [...new Set(rawPosts.filter(p => p.topic_id).map(p => p.topic_id!))];
    let topicMap: Record<string, any> = {};
    if (topicIds.length) {
      const { data: topics } = await supabase
        .from("community_topics")
        .select("id, name, emoji")
        .in("id", topicIds);
      topics?.forEach(t => { topicMap[t.id] = t; });
    }

    // fetch user likes/favorites
    let userLikes = new Set<string>();
    let userFavorites = new Set<string>();
    if (userId) {
      const postIds = rawPosts.map(p => p.id);
      const [likesRes, favsRes] = await Promise.all([
        supabase.from("community_likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
        supabase.from("community_favorites").select("post_id").eq("user_id", userId).in("post_id", postIds),
      ]);
      likesRes.data?.forEach(l => userLikes.add(l.post_id));
      favsRes.data?.forEach(f => userFavorites.add(f.post_id));
    }

    let enriched: CommunityPost[] = rawPosts.map(p => ({
      ...p,
      hashtags: p.hashtags || [],
      author_name: profileMap[p.user_id]?.name || "Usuário",
      author_avatar: profileMap[p.user_id]?.avatar_url || null,
      author_role: profileMap[p.user_id]?.target_role || "",
      author_level: profileMap[p.user_id]?.level || "",
      author_area: profileMap[p.user_id]?.area || "",
      topic_name: p.topic_id ? topicMap[p.topic_id]?.name : null,
      topic_emoji: p.topic_id ? topicMap[p.topic_id]?.emoji : null,
      liked: userLikes.has(p.id),
      favorited: userFavorites.has(p.id),
    }));

    // client-side filters
    if (filter === "trending") {
      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      enriched = enriched
        .filter(p => new Date(p.created_at).getTime() > cutoff)
        .sort((a, b) => {
          const scoreA = a.likes_count + a.favorites_count * 2 + a.comments_count * 0.5;
          const scoreB = b.likes_count + b.favorites_count * 2 + b.comments_count * 0.5;
          return scoreB - scoreA;
        });
    }
    if (filter === "favorites") {
      enriched = enriched.filter(p => p.favorited);
    }

    if (reset) {
      setPosts(enriched);
    } else {
      setPosts(prev => [...prev, ...enriched]);
    }
    setLoading(false);
  }, [page, filter, topicFilter, userId]);

  useEffect(() => {
    setLoading(true);
    fetchPosts(true);
  }, [filter, topicFilter]);

  const loadMore = () => {
    setPage(p => p + 1);
    fetchPosts(false);
  };

  const toggleLike = async (postId: string) => {
    if (!userId) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.liked) {
      await supabase.from("community_likes").delete().eq("user_id", userId).eq("post_id", postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: false, likes_count: Math.max(0, p.likes_count - 1) } : p));
    } else {
      await supabase.from("community_likes").insert({ user_id: userId, post_id: postId });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: true, likes_count: p.likes_count + 1 } : p));
    }
  };

  const toggleFavorite = async (postId: string) => {
    if (!userId) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.favorited) {
      await supabase.from("community_favorites").delete().eq("user_id", userId).eq("post_id", postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, favorited: false, favorites_count: Math.max(0, p.favorites_count - 1) } : p));
    } else {
      await supabase.from("community_favorites").insert({ user_id: userId, post_id: postId });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, favorited: true, favorites_count: p.favorites_count + 1 } : p));
    }
  };

  return { posts, loading, filter, setFilter, topicFilter, setTopicFilter, hasMore, loadMore, toggleLike, toggleFavorite, refetch: () => fetchPosts(true) };
}
