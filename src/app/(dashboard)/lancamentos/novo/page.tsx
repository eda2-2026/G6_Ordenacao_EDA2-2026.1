"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormLancamento from "@/components/lancamentos/FormLancamento";

export default function NovoLancamentoPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Novo Lançamento</h1>
        <p className="text-muted-foreground mt-1.5">Registre uma entrada ou saída financeira</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Dados do lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <FormLancamento />
        </CardContent>
      </Card>
    </div>
  );
}
