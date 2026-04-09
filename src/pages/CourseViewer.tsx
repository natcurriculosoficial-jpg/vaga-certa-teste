import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  video_url: string | null;
  sort_order: number;
  module_id: string;
}

export default function CourseViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", id)
        .single();
      setCourseTitle(course?.title || "");

      const { data: mods } = await supabase
        .from("modules")
        .select("id, title, sort_order")
        .eq("course_id", id)
        .order("sort_order");

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, video_url, sort_order, module_id")
        .in("module_id", (mods || []).map(m => m.id))
        .order("sort_order");

      const built = (mods || []).map(m => ({
        ...m,
        lessons: (lessons || []).filter(l => l.module_id === m.id),
      }));
      setModules(built);
      // Select first lesson
      const first = built[0]?.lessons[0];
      if (first) setActiveLesson(first);
      setLoading(false);
    };
    load();
  }, [id]);

  const allLessons = useMemo(
    () => modules.flatMap(m => m.lessons),
    [modules]
  );

  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);

  const goPrev = () => {
    if (currentIndex > 0) setActiveLesson(allLessons[currentIndex - 1]);
  };
  const goNext = () => {
    if (currentIndex < allLessons.length - 1) setActiveLesson(allLessons[currentIndex + 1]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 0 }}
        className="hidden md:block overflow-hidden border-r border-border bg-card shrink-0"
      >
        <div className="p-4 border-b border-border">
          <button onClick={() => navigate("/members")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Voltar
          </button>
          <h2 className="font-semibold text-foreground text-sm mt-2 truncate">{courseTitle}</h2>
        </div>
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2 space-y-3">
            {modules.map(mod => (
              <div key={mod.id}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {mod.title}
                </p>
                {mod.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={cn(
                      "w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                      activeLesson?.id === lesson.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/70 hover:bg-muted"
                    )}
                  >
                    <Play className="h-3 w-3 shrink-0" />
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeLesson ? (
          <>
            <div className="aspect-video bg-black w-full">
              {activeLesson.video_url ? (
                <iframe
                  src={toEmbedUrl(activeLesson.video_url)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                  <p>Vídeo não disponível</p>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-auto">
              <h1 className="text-lg font-bold text-foreground">{activeLesson.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Aula {currentIndex + 1} de {allLessons.length}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={currentIndex <= 0} onClick={goPrev}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={currentIndex >= allLessons.length - 1} onClick={goNext}>
                  Próxima <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma aula disponível neste curso.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
