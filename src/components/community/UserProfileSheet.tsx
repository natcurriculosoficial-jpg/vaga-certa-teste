import { useState, useEffect } from "react";
import { Linkedin, Instagram, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
  target_role: string | null;
  level: string | null;
  area: string | null;
  objective: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
}

export default function UserProfileSheet({
  userId,
  open,
  onClose,
}: {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { session } = useAuth();
  const myId = session?.user?.id;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, target_role, level, area, objective, linkedin_url, instagram_url")
        .eq("user_id", userId)
        .single();
      setProfile(data as UserProfile | null);

      if (myId && myId !== userId) {
        const { data: f } = await supabase
          .from("community_follows")
          .select("id")
          .eq("follower_id", myId)
          .eq("following_id", userId)
          .maybeSingle();
        setFollowing(!!f);
      }
      setLoading(false);
    })();
  }, [userId, open, myId]);

  const toggleFollow = async () => {
    if (!myId || !userId) return;
    setFollowLoading(true);
    if (following) {
      await supabase.from("community_follows").delete().eq("follower_id", myId).eq("following_id", userId);
      setFollowing(false);
    } else {
      await supabase.from("community_follows").insert({ follower_id: myId, following_id: userId });
      setFollowing(true);
    }
    setFollowLoading(false);
  };

  const initials = (profile?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-[340px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>Perfil</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-5 w-40 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : profile ? (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col items-center text-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
              )}
              <h3 className="font-bold text-foreground mt-3">{profile.name}</h3>
              {profile.target_role && <p className="text-sm text-muted-foreground">{profile.target_role}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {profile.level && <span>{profile.level}</span>}
                {profile.area && <span>· {profile.area}</span>}
              </div>
            </div>

            {profile.objective && (
              <p className="text-xs text-foreground/70 leading-relaxed text-center">{profile.objective}</p>
            )}

            <div className="flex items-center justify-center gap-3">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url.startsWith("http") ? profile.linkedin_url : `https://${profile.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.instagram_url && (
                <a href={profile.instagram_url.startsWith("http") ? profile.instagram_url : `https://instagram.com/${profile.instagram_url.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>

            {myId && myId !== userId && (
              <Button
                onClick={toggleFollow}
                disabled={followLoading}
                variant={following ? "outline" : "default"}
                className={`w-full ${!following ? "gradient-primary text-white" : ""}`}
              >
                {followLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : following ? <UserCheck className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                {following ? "Seguindo" : "Seguir"}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground mt-10">Perfil não encontrado</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
