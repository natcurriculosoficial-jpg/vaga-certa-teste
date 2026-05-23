import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  city: string;
  linkedin: string;
  portfolio: string;
  objective: string;
  experiences: { company: string; role: string; period: string; description: string }[];
  educations: { institution: string; course: string; period: string }[];
  courses: { name: string; institution: string }[];
  skills: string[];
  languages: { lang: string; level: string }[];
}

interface ResumeExportProps {
  data: ResumeData;
}

function groupByCompany(experiences: ResumeData["experiences"]) {
  const grouped: { company: string; roles: ResumeData["experiences"] }[] = [];
  for (const exp of experiences) {
    const label = exp.company?.trim() || "Sem empresa informada";
    const key = label.toLowerCase();
    const existing = grouped.find(g => g.company.trim().toLowerCase() === key);
    if (existing) existing.roles.push(exp);
    else grouped.push({ company: label, roles: [exp] });
  }
  return grouped;
}

export default function ResumeExport({ data }: ResumeExportProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);

  const baseFileName = (data.name || "MEU CURRICULO").toUpperCase();

  const downloadPDF = async () => {
    setLoadingPdf(true);
    try {
      const element = document.getElementById("resume-preview");
      if (!element) throw new Error("Preview not found");

      const html2pdf = (await import("html2pdf.js")).default;
      const options = {
        margin: [12, 12, 12, 12] as [number, number, number, number],
        filename: `${baseFileName} – CV.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(options).from(element).save();
      toast({ title: "✅ Currículo exportado como PDF!" });
    } catch (err) {
      console.error("PDF error:", err);
      toast({ title: "❌ Erro ao exportar PDF", variant: "destructive" });
    }
    setLoadingPdf(false);
  };

  const downloadDOCX = async () => {
    setLoadingDocx(true);
    try {
      const children: Paragraph[] = [];
      const FONT = "Arial";
      const SIZE = 22; // 11pt
      const SMALL = 20;

      const sectionHeader = (text: string) => new Paragraph({
        children: [new TextRun({ text, bold: true, size: SIZE, font: FONT })],
        spacing: { before: 300, after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 1 } },
      });

      // Nome
      children.push(new Paragraph({
        children: [new TextRun({ text: baseFileName, bold: true, size: 32, font: FONT })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }));

      // Contato
      const contactParts = [data.phone, data.city, data.linkedin, data.portfolio].filter(Boolean);
      if (contactParts.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: contactParts.join(" | "), size: SMALL, font: FONT, color: "555555" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }));
      }

      // Resumo (sem título)
      if (data.objective) {
        children.push(new Paragraph({
          children: [new TextRun({ text: data.objective, size: SIZE, font: FONT })],
          spacing: { before: 100, after: 200 },
        }));
      }

      // Formação
      if (data.educations.length > 0) {
        children.push(sectionHeader("FORMAÇÃO ACADÊMICA"));
        data.educations.forEach((edu) => {
          children.push(new Paragraph({
            children: [new TextRun({ text: edu.course || "", bold: true, size: SIZE, font: FONT })],
            spacing: { before: 80 },
          }));
          children.push(new Paragraph({
            children: [new TextRun({
              text: `${edu.institution}${edu.period ? ` | ${edu.period}` : ""}`,
              size: SMALL, font: FONT, color: "666666",
            })],
          }));
        });
      }

      // Experiência (agrupada por empresa)
      if (data.experiences.length > 0) {
        children.push(sectionHeader("EXPERIÊNCIA PROFISSIONAL"));
        const grouped = groupByCompany(data.experiences);
        grouped.forEach((group) => {
          children.push(new Paragraph({
            children: [new TextRun({ text: group.company, bold: true, italics: true, size: SIZE, font: FONT })],
            spacing: { before: 160 },
          }));
          group.roles.forEach((role) => {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: "    - ", size: SIZE, font: FONT }),
                new TextRun({ text: role.role, bold: true, size: SIZE, font: FONT }),
                new TextRun({ text: role.period ? ` | ${role.period}` : "", size: SMALL, font: FONT, color: "666666" }),
              ],
              spacing: { before: 60 },
            }));
            if (role.description) {
              role.description.split("\n").filter(Boolean).forEach((line) => {
                children.push(new Paragraph({
                  children: [new TextRun({ text: `      ${line.trim()}`, size: SIZE, font: FONT })],
                  spacing: { before: 20 },
                }));
              });
            }
          });
        });
      }

      // Habilidades
      if (data.skills.length > 0) {
        children.push(sectionHeader("HABILIDADES E FERRAMENTAS"));
        children.push(new Paragraph({
          children: [new TextRun({ text: data.skills.join(" • "), size: SIZE, font: FONT })],
        }));
      }

      // Idiomas
      if (data.languages.length > 0) {
        children.push(sectionHeader("IDIOMAS"));
        data.languages.forEach((l) => {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: l.lang, bold: true, size: SIZE, font: FONT }),
              new TextRun({ text: ` — ${l.level}`, size: SIZE, font: FONT }),
            ],
          }));
        });
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
          },
          children,
        }],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${baseFileName} – CV.docx`);
      toast({ title: "✅ Currículo exportado como DOCX!" });
    } catch (err) {
      console.error("DOCX error:", err);
      toast({ title: "❌ Erro ao exportar DOCX", variant: "destructive" });
    }
    setLoadingDocx(false);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-xs rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={downloadPDF}
        disabled={loadingPdf}
      >
        {loadingPdf ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileDown className="h-3 w-3 mr-1" />}
        Baixar PDF
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-xs rounded-xl border-secondary/30 text-secondary hover:bg-secondary/10"
        onClick={downloadDOCX}
        disabled={loadingDocx}
      >
        {loadingDocx ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
        Baixar DOCX
      </Button>
    </div>
  );
}
