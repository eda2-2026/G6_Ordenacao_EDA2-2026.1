"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadComprovante from "@/components/comprovante/UploadComprovante";
import FormLancamento from "@/components/lancamentos/FormLancamento";
import type { LancamentoInput } from "@/lib/validations/lancamento";
import { matchCategoryBySuggestion, type CategoryLike } from "@/lib/utils/categories";

interface ExtractionResult {
  type: "ENTRADA" | "SAIDA";
  value: number;
  date: string;
  description: string;
  establishment: string;
  suggestedCategory: string;
}

export default function ComprovantePage() {
  const [extractedData, setExtractedData] = useState<Partial<LancamentoInput> | null>(null);

  async function handleExtracted(data: ExtractionResult) {
    let categoryId: string | undefined;

    try {
      const res = await fetch("/api/categorias");
      const json = await res.json();
      const categories: CategoryLike[] = Array.isArray(json.data) ? json.data : [];
      categoryId = matchCategoryBySuggestion(categories, data.suggestedCategory)?.id;
    } catch {
      categoryId = undefined;
    }

    setExtractedData({
      type: data.type,
      value: data.value,
      date: data.date || "",
      description: data.description || data.establishment || "",
      categoryId,
    });
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Comprovante IA</h1>
        <p className="text-muted-foreground mt-1.5">Envie um comprovante para extração automática por IA</p>
      </div>

      {!extractedData ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Upload de comprovante</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadComprovante onExtracted={handleExtracted} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Confirmar dados extraídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                ✨ Dados extraídos pela IA. Revise e edite se necessário antes de confirmar.
              </p>
            </div>
            <FormLancamento defaultValues={extractedData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
