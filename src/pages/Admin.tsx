import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronRight,
  Save, X, Loader2, BookOpen, Video, Layers,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/* ─── Types ─── */
interface Course { id: string; title: string; description: string | null; thumbnail_url: string | null; published: boolean; }
interface Module { id: string; course_id: string; title: string; sort_order: number; }
interface Lesson { id: string; module_id: string; title: string; video_url: string | null; sort_order: number; }

export default function Admin() {
  const { isAdmin, loading: roleLoading } = useAdmin();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Course dialog
  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Partial<Course> | null>(null);

  // Expanded course
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Module dialog
  const [moduleDialog, setModuleDialog] = useState(false);
  const [editModule, setEditModule] = useState<Partial<Module> & { course_id?: string } | null>(null);

  // Lesson dialog
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editLesson, setEditLesson] = useState<Partial<Lesson> & { module_id?: string } | null>(null);

  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at");
    setCourses(data || []);
    setLoading(false);
  };

  const fetchModulesAndLessons = async (courseId: string) => {
    const { data: mods } = await supabase
      .from("modules").select("*").eq("course_id", courseId).order("sort_order");
    setModules(mods || []);
    if (mods && mods.length > 0) {
      const { data: lsns } = await supabase
        .from("lessons").select("*")
        .in("module_id", mods.map(m => m.id))
        .order("sort_order");
      setLessons(lsns || []);
    } else {
      setLessons([]);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (expandedCourse) fetchModulesAndLessons(expandedCourse);
  }, [expandedCourse]);

  /* ─── COURSE CRUD ─── */
  const saveCourse = async () => {
    if (!editCourse?.title) return;
    setSaving(true);
    if (editCourse.id) {
      const { error } = await supabase.from("courses").update({
        title: editCourse.title,
        description: editCourse.description || null,
        thumbnail_url: editCourse.thumbnail_url || null,
        published: editCourse.published ?? false,
      }).eq("id", editCourse.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else toast({ title: "✅ Curso atualizado!" });
    } else {
      const { error } = await supabase.from("courses").insert({
        title: editCourse.title,
        description: editCourse.description || null,
        thumbnail_url: editCourse.thumbnail_url || null,
        published: editCourse.published ?? false,
      });
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
      else toast({ title: "✅ Curso criado!" });
    }
    setSaving(false);
    setCourseDialog(false);
    setEditCourse(null);
    fetchCourses();
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Deletar este curso e todo seu conteúdo?")) return;
    await supabase.from("courses").delete().eq("id", id);
    toast({ title: "Curso deletado" });
    if (expandedCourse === id) setExpandedCourse(null);
    fetchCourses();
  };

  /* ─── MODULE CRUD ─── */
  const saveModule = async () => {
    if (!editModule?.title || !editModule.course_id) return;
    setSaving(true);
    if (editModule.id) {
      await supabase.from("modules").update({ title: editModule.title, sort_order: editModule.sort_order ?? 0 }).eq("id", editModule.id);
      toast({ title: "✅ Módulo atualizado!" });
    } else {
      const maxOrder = modules.filter(m => m.course_id === editModule.course_id).length;
      await supabase.from("modules").insert({
        course_id: editModule.course_id,
        title: editModule.title,
        sort_order: maxOrder,
      });
      toast({ title: "✅ Módulo criado!" });
    }
    setSaving(false);
    setModuleDialog(false);
    setEditModule(null);
    if (expandedCourse) fetchModulesAndLessons(expandedCourse);
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Deletar este módulo e suas aulas?")) return;
    await supabase.from("modules").delete().eq("id", id);
    toast({ title: "Módulo deletado" });
    if (expandedCourse) fetchModulesAndLessons(expandedCourse);
  };

  /* ─── LESSON CRUD ─── */
  const saveLesson = async () => {
    if (!editLesson?.title || !editLesson.module_id) return;
    setSaving(true);
    if (editLesson.id) {
      await supabase.from("lessons").update({
        title: editLesson.title,
        video_url: editLesson.video_url || null,
        sort_order: editLesson.sort_order ?? 0,
      }).eq("id", editLesson.id);
      toast({ title: "✅ Aula atualizada!" });
    } else {
      const maxOrder = lessons.filter(l => l.module_id === editLesson.module_id).length;
      await supabase.from("lessons").insert({
        module_id: editLesson.module_id,
        title: editLesson.title,
        video_url: editLesson.video_url || null,
        sort_order: maxOrder,
      });
      toast({ title: "✅ Aula criada!" });
    }
    setSaving(false);
    setLessonDialog(false);
    setEditLesson(null);
    if (expandedCourse) fetchModulesAndLessons(expandedCourse);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Deletar esta aula?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    toast({ title: "Aula deletada" });
    if (expandedCourse) fetchModulesAndLessons(expandedCourse);
  };

  /* ─── ACCESS GUARD ─── */
  if (roleLoading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">Acesso restrito</p>
        <p className="text-sm text-muted-foreground mt-1">Você não tem permissão para acessar o painel administrativo.</p>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie cursos, módulos e aulas</p>
        </div>
        <Button onClick={() => { setEditCourse({ title: "", description: "", published: false }); setCourseDialog(true); }} className="gradient-primary text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Curso
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum curso criado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => {
            const isOpen = expandedCourse === course.id;
            const courseMods = modules.filter(m => m.course_id === course.id);

            return (
              <div key={course.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Course header */}
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedCourse(isOpen ? null : course.id)}>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${course.published ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                        {course.published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    {course.description && <p className="text-xs text-muted-foreground truncate">{course.description}</p>}
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCourse(course); setCourseDialog(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCourse(course.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded modules */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-border p-4 space-y-3 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Módulos</p>
                          <Button size="sm" variant="outline" onClick={() => { setEditModule({ title: "", course_id: course.id }); setModuleDialog(true); }}>
                            <Plus className="h-3 w-3 mr-1" /> Módulo
                          </Button>
                        </div>

                        {courseMods.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Nenhum módulo. Crie o primeiro.</p>
                        ) : (
                          courseMods.map(mod => {
                            const modLessons = lessons.filter(l => l.module_id === mod.id);
                            return (
                              <div key={mod.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-sm text-foreground">{mod.title}</span>
                                    <span className="text-[10px] text-muted-foreground">({modLessons.length} aulas)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditModule(mod); setModuleDialog(true); }}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteModule(mod.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Lessons */}
                                <div className="pl-6 space-y-1">
                                  {modLessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/30">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Video className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <span className="text-sm text-foreground truncate">{lesson.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditLesson(lesson); setLessonDialog(true); }}>
                                          <Pencil className="h-2.5 w-2.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteLesson(lesson.id)}>
                                          <Trash2 className="h-2.5 w-2.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground" onClick={() => { setEditLesson({ title: "", module_id: mod.id }); setLessonDialog(true); }}>
                                    <Plus className="h-3 w-3 mr-1" /> Aula
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Course Dialog ─── */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCourse?.id ? "Editar Curso" : "Novo Curso"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input value={editCourse?.title || ""} onChange={e => setEditCourse(p => ({ ...p, title: e.target.value }))} placeholder="Nome do curso" /></div>
            <div><Label>Descrição</Label><Textarea value={editCourse?.description || ""} onChange={e => setEditCourse(p => ({ ...p, description: e.target.value }))} placeholder="Descrição breve" /></div>
            <div><Label>URL da Thumbnail</Label><Input value={editCourse?.thumbnail_url || ""} onChange={e => setEditCourse(p => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://..." /></div>
            <div className="flex items-center gap-2">
              <Switch checked={editCourse?.published ?? false} onCheckedChange={v => setEditCourse(p => ({ ...p, published: v }))} />
              <Label>Publicado</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialog(false)}>Cancelar</Button>
            <Button onClick={saveCourse} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Module Dialog ─── */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editModule?.id ? "Editar Módulo" : "Novo Módulo"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título do Módulo</Label><Input value={editModule?.title || ""} onChange={e => setEditModule(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Introdução" /></div>
            <div><Label>Ordem</Label><Input type="number" value={editModule?.sort_order ?? 0} onChange={e => setEditModule(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog(false)}>Cancelar</Button>
            <Button onClick={saveModule} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Lesson Dialog ─── */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editLesson?.id ? "Editar Aula" : "Nova Aula"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título da Aula</Label><Input value={editLesson?.title || ""} onChange={e => setEditLesson(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Boas-vindas" /></div>
            <div><Label>URL do Vídeo (YouTube)</Label><Input value={editLesson?.video_url || ""} onChange={e => setEditLesson(p => ({ ...p, video_url: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." /></div>
            <div><Label>Ordem</Label><Input type="number" value={editLesson?.sort_order ?? 0} onChange={e => setEditLesson(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancelar</Button>
            <Button onClick={saveLesson} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
