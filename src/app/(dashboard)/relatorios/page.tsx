"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RelatoriosPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  function buildParams() {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return params.toString();
  }

  async function downloadPdf() {
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/relatorios/pdf?${buildParams()}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Erro ao gerar PDF" }));
        toast.error(json.error);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-konta.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF");
    } finally {
      setLoadingPdf(false);
    }
  }

  async function downloadExcel() {
    setLoadingExcel(true);
    try {
      const res = await fetch(`/api/relatorios/excel?${buildParams()}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Erro ao gerar Excel" }));
        toast.error(json.error);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-konta.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar Excel");
    } finally {
      setLoadingExcel(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Relatórios</h1>
        <p className="text-muted-foreground mt-1.5">Gere relatórios e exporte em PDF ou Excel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Filtros do relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label>Data inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadPdf} disabled={loadingPdf} className="bg-red-600 hover:bg-red-700">
              {loadingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              Exportar PDF
            </Button>
            <Button onClick={downloadExcel} disabled={loadingExcel} className="bg-emerald-600 hover:bg-emerald-700">
              {loadingExcel ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
