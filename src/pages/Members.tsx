import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Play, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

export default function Members() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("courses")
      .select("id, title, description, thumbnail_url")
      .eq("published", true)
      .order("created_at")
      .then(({ data }) => {
        setCourses(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Área de Membros</h1>
        <p className="text-sm text-muted-foreground mt-1">Seus cursos e conteúdos exclusivos</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum curso disponível ainda.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/members/course/${c.id}`)}
              className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.title} className="object-cover w-full h-full" />
                ) : (
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
