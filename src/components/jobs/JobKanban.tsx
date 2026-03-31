import { useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent, DragOverlay, DragStartEvent, useDroppable,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export interface KanbanJob {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  type?: string | null;
  url?: string | null;
  notes?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const COLUMNS = [
  { id: "saved", label: "🔖 Salvei", color: "border-muted-foreground/20" },
  { id: "applied", label: "📩 Candidatei", color: "border-primary/30" },
  { id: "process", label: "👁️ Em análise", color: "border-warning/30" },
  { id: "interview", label: "🗓️ Entrevista", color: "border-success/30" },
  { id: "offer", label: "✅ Oferta", color: "border-emerald-500/30" },
  { id: "archived", label: "❌ Arquivado", color: "border-destructive/30" },
];

function KanbanCard({ job, onClick }: { job: KanbanJob; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-3 rounded-lg border border-border/50 bg-background/80 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing group"
    >
      <p className="text-xs font-semibold text-foreground leading-tight">{job.title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{job.company}</p>
      {job.location && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{job.location}</p>}
      <div className="flex items-center gap-2 mt-2">
        {job.notes && <MessageSquare className="h-3 w-3 text-muted-foreground/50" />}
        {job.url && (
          <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <ExternalLink className="h-3 w-3 text-muted-foreground/50 hover:text-primary" />
          </a>
        )}
      </div>
    </div>
  );
}

function DroppableColumn({ id, label, color, jobs, onCardClick }: {
  id: string; label: string; color: string;
  jobs: KanbanJob[]; onCardClick: (j: KanbanJob) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[200px] md:min-w-0 space-y-2 transition-colors ${isOver ? "bg-primary/5 rounded-xl" : ""}`}
    >
      <h3 className={`text-xs font-semibold text-muted-foreground flex items-center gap-2 pb-1 border-b-2 ${color}`}>
        {label}
        <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded-full">{jobs.length}</span>
      </h3>
      <div className="space-y-2 min-h-[120px]">
        {jobs.map(job => (
          <KanbanCard key={job.id} job={job} onClick={() => onCardClick(job)} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  jobs: KanbanJob[];
  onMoveJob: (id: string, newStatus: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export default function JobKanban({ jobs, onMoveJob, onUpdateNotes }: Props) {
  const [selectedJob, setSelectedJob] = useState<KanbanJob | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id as string;
    const targetColumn = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.some(c => c.id === targetColumn)) {
      const job = jobs.find(j => j.id === jobId);
      if (job && job.status !== targetColumn) {
        onMoveJob(jobId, targetColumn);
      }
    }
  };

  const openDetail = (job: KanbanJob) => {
    setSelectedJob(job);
    setEditNotes(job.notes || "");
  };

  const saveNotes = () => {
    if (selectedJob) {
      onUpdateNotes(selectedJob.id, editNotes);
      setSelectedJob(null);
    }
  };

  const activeJob = activeId ? jobs.find(j => j.id === activeId) : null;

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 overflow-x-auto">
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              jobs={jobs.filter(j => j.status === col.id)}
              onCardClick={openDetail}
            />
          ))}
        </div>
        <DragOverlay>
          {activeJob && (
            <div className="p-3 rounded-lg border border-primary/50 bg-background shadow-lg">
              <p className="text-xs font-semibold">{activeJob.title}</p>
              <p className="text-[11px] text-muted-foreground">{activeJob.company}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Detail Sheet */}
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedJob && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="text-lg">{selectedJob.title}</SheetTitle>
                <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
              </SheetHeader>

              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {selectedJob.location && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{selectedJob.location}</span>
                  )}
                  {selectedJob.type && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{selectedJob.type}</span>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Timeline
                  </h4>
                  {COLUMNS.map(col => {
                    const isCurrent = selectedJob.status === col.id;
                    const colIndex = COLUMNS.findIndex(c => c.id === col.id);
                    const currentIndex = COLUMNS.findIndex(c => c.id === selectedJob.status);
                    const isPast = colIndex < currentIndex;
                    return (
                      <div key={col.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isCurrent ? "bg-primary" : isPast ? "bg-muted-foreground/40" : "bg-muted/50"}`} />
                        <span className={`text-xs ${isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {col.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">📝 Notas</h4>
                  <Textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Adicione notas sobre esta vaga..."
                    className="bg-muted/50 min-h-[100px] text-sm"
                  />
                  <Button size="sm" onClick={saveNotes}>Salvar notas</Button>
                </div>

                {selectedJob.url && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={selectedJob.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" /> Ver vaga original
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
