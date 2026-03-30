import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
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

export default function ResumeExport({ data }: ResumeExportProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);

  const downloadPDF = async () => {
    setLoadingPdf(true);
    try {
      const element = document.getElementById("resume-preview");
      if (!element) throw new Error("Preview not found");

      const html2pdf = (await import("html2pdf.js")).default;
      const options = {
        margin: [10, 10, 10, 10],
        filename: `curriculo-${data.name || "meu"}-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
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

      // Name
      children.push(
        new Paragraph({
          children: [new TextRun({ text: data.name || "Seu Nome", bold: true, size: 32, font: "Arial" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );

      // Contact info
      const contactParts = [data.email, data.phone, data.city, data.linkedin].filter(Boolean);
      if (contactParts.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: contactParts.join(" | "), size: 18, font: "Arial", color: "666666" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      }

      // Objective
      if (data.objective) {
        children.push(
          new Paragraph({ text: "OBJETIVO", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 } })
        );
        children.push(new Paragraph({ children: [new TextRun({ text: data.objective, size: 22, font: "Arial" })] }));
      }

      // Experience
      if (data.experiences.length > 0) {
        children.push(
          new Paragraph({ text: "EXPERIÊNCIA PROFISSIONAL", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 80 } })
        );
        data.experiences.forEach((exp) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.role || "", bold: true, size: 22, font: "Arial" }),
                new TextRun({ text: exp.company ? ` — ${exp.company}` : "", size: 22, font: "Arial" }),
              ],
              spacing: { before: 120 },
            })
          );
          if (exp.period) {
            children.push(new Paragraph({ children: [new TextRun({ text: exp.period, size: 20, font: "Arial", color: "888888" })] }));
          }
          if (exp.description) {
            exp.description.split("\n").forEach((line) => {
              children.push(new Paragraph({ children: [new TextRun({ text: line, size: 22, font: "Arial" })], spacing: { before: 40 } }));
            });
          }
        });
      }

      // Education
      if (data.educations.length > 0) {
        children.push(
          new Paragraph({ text: "FORMAÇÃO ACADÊMICA", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 80 } })
        );
        data.educations.forEach((edu) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: edu.course || "", bold: true, size: 22, font: "Arial" }),
                new TextRun({ text: edu.institution ? ` — ${edu.institution}` : "", size: 22, font: "Arial" }),
              ],
            })
          );
          if (edu.period) {
            children.push(new Paragraph({ children: [new TextRun({ text: edu.period, size: 20, font: "Arial", color: "888888" })] }));
          }
        });
      }

      // Skills
      if (data.skills.length > 0) {
        children.push(
          new Paragraph({ text: "HABILIDADES", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 80 } })
        );
        children.push(new Paragraph({ children: [new TextRun({ text: data.skills.join(" • "), size: 22, font: "Arial" })] }));
      }

      // Languages
      if (data.languages.length > 0) {
        children.push(
          new Paragraph({ text: "IDIOMAS", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 80 } })
        );
        data.languages.forEach((l) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: l.lang, bold: true, size: 22, font: "Arial" }),
                new TextRun({ text: ` — ${l.level}`, size: 22, font: "Arial" }),
              ],
            })
          );
        });
      }

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `curriculo-${data.name || "meu"}-${Date.now()}.docx`);
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
