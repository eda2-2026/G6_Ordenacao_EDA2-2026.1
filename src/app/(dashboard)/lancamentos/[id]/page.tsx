"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FormLancamento from "@/components/lancamentos/FormLancamento";
import type { LancamentoInput } from "@/lib/validations/lancamento";

export default function EditarLancamentoPage() {
  const params = useParams();
  const id = params.id as string;
  const [defaultValues, setDefaultValues] = useState<Partial<LancamentoInput> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/lancamentos/${id}`);
        const json = await res.json();
        if (json.data) {
          const t = json.data;
          setDefaultValues({
            type: t.type,
            value: Number(t.value),
            date: new Date(t.date).toISOString().slice(0, 16),
            description: t.description,
            notes: t.notes || undefined,
            categoryId: t.categoryId,
            isRecurring: t.isRecurring,
            recurrenceFrequency: t.recurrenceFrequency || undefined,
          });
        }
      } catch {
        console.error("Erro ao carregar lançamento");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Editar Lançamento</h1>
        <p className="text-muted-foreground mt-1.5">Altere os dados do lançamento</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Dados do lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : defaultValues ? (
            <FormLancamento lancamentoId={id} defaultValues={defaultValues} />
          ) : (
            <p className="text-muted-foreground">Lançamento não encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
