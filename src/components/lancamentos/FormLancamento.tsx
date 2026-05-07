"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lancamentoSchema, type LancamentoInput } from "@/lib/validations/lancamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface FormLancamentoProps {
  lancamentoId?: string;
  defaultValues?: Partial<LancamentoInput>;
}

export default function FormLancamento({ lancamentoId, defaultValues }: FormLancamentoProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">(defaultValues?.type || "SAIDA");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LancamentoInput>({
    resolver: zodResolver(lancamentoSchema),
    defaultValues: {
      type: "SAIDA",
      isRecurring: false,
      ...defaultValues,
    },
  });

  const isRecurring = watch("isRecurring");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categorias");
      const json = await res.json();
      if (json.data) setCategories(json.data.filter((c: Category) => c.isActive));
    } catch {
      console.error("Erro ao carregar categorias");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function onSubmit(data: LancamentoInput) {
    setIsLoading(true);
    try {
      const url = lancamentoId ? `/api/lancamentos/${lancamentoId}` : "/api/lancamentos";
      const method = lancamentoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao salvar lançamento");
        return;
      }

      toast.success(lancamentoId ? "Lançamento atualizado!" : "Lançamento criado!");
      router.push("/lancamentos");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar lançamento");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type Toggle */}
      <div className="space-y-2">
        <Label>Tipo</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={tipo === "ENTRADA" ? "default" : "outline"}
            className={tipo === "ENTRADA" ? "bg-emerald-600 hover:bg-emerald-700 flex-1" : "flex-1"}
            onClick={() => { setTipo("ENTRADA"); setValue("type", "ENTRADA"); }}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" /> Entrada
          </Button>
          <Button
            type="button"
            variant={tipo === "SAIDA" ? "default" : "outline"}
            className={tipo === "SAIDA" ? "bg-red-600 hover:bg-red-700 flex-1" : "flex-1"}
            onClick={() => { setTipo("SAIDA"); setValue("type", "SAIDA"); }}
          >
            <ArrowDownRight className="h-4 w-4 mr-2" /> Saída
          </Button>
        </div>
      </div>

      {/* Value */}
      <div className="space-y-2">
        <Label htmlFor="value">Valor (R$)</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          {...register("value", { valueAsNumber: true })}
        />
        {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" placeholder="Ex: Pagamento fornecedor X" {...register("description")} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select onValueChange={(v) => setValue("categoryId", v)} defaultValue={defaultValues?.categoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" placeholder="Detalhes adicionais..." rows={3} {...register("notes")} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
      </div>

      {/* Recurring */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="recurring">Lançamento recorrente</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Repetir automaticamente este lançamento</p>
        </div>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(v) => setValue("isRecurring", v)}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label>Frequência</Label>
          <Select onValueChange={(v) => setValue("recurrenceFrequency", v as "DIARIA" | "SEMANAL" | "MENSAL")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIARIA">Diária</SelectItem>
              <SelectItem value="SEMANAL">Semanal</SelectItem>
              <SelectItem value="MENSAL">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : lancamentoId ? "Atualizar" : "Criar lançamento"}
        </Button>
      </div>
    </form>
  );
}
