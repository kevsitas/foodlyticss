"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportData {
  clients: number;
  mealPlans: number;
  completedAppts: number;
  monthlyRevenue: number;
  appointmentStats: { completed: number; cancelled: number; scheduled: number; total: number };
  clientGrowth: { labels: string[]; counts: number[] };
  currentDate: string;
}

export function ExportButton({ data }: { data: ExportData }) {
  const [loading, setLoading] = useState(false);

  const exportPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Reporte de Analiticas", pageWidth / 2, 20, { align: "center" });

      // Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado: ${data.currentDate}`, pageWidth / 2, 28, { align: "center" });

      // Divider
      doc.setDrawColor(200);
      doc.line(14, 33, pageWidth - 14, 33);

      // Summary section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumen General", 14, 43);

      const summaryRows = [
        ["Total de Clientes", String(data.clients)],
        ["Planes de Comida Activos", String(data.mealPlans)],
        ["Citas Completadas", String(data.completedAppts)],
        ["Ingresos del Mes", `$${data.monthlyRevenue.toFixed(2)}`],
      ];

      autoTable(doc, {
        startY: 48,
        head: [["Metrica", "Valor"]],
        body: summaryRows,
        theme: "striped",
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 10 },
      });

      // Appointment stats
      let finalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Estado de Citas", 14, finalY);

      finalY += 5;
      const apptRows = [
        ["Completadas", String(data.appointmentStats.completed)],
        ["Programadas", String(data.appointmentStats.scheduled)],
        ["Canceladas", String(data.appointmentStats.cancelled)],
        ["Total", String(data.appointmentStats.total)],
      ];

      autoTable(doc, {
        startY: finalY,
        head: [["Estado", "Cantidad"]],
        body: apptRows,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10 },
      });

      // Client growth
      finalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Crecimiento de Clientes", 14, finalY);

      finalY += 5;
      const growthRows = data.clientGrowth.labels.map((label, i) => [
        label,
        String(data.clientGrowth.counts[i]),
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [["Mes", "Nuevos Clientes"]],
        body: growthRows,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });

      // Footer
      finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text("Foodlytics - Reporte generado automaticamente", pageWidth / 2, finalY, { align: "center" });

      // Download
      doc.save(`reporte-analiticas-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (e) {
      console.error("Error generando PDF:", e);
      alert("Error al generar el reporte.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={exportPDF}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Exportar Reporte
    </button>
  );
}