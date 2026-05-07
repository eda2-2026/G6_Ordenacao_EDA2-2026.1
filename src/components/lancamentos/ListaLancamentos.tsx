"use client";

import { formatBRL, formatDate } from "@/lib/utils/formatters";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  type: "ENTRADA" | "SAIDA";
  value: string | number;
  date: string;
  description: string;
  category: { id: string; name: string; icon: string; color: string };
  user: { id: string; name: string };
}

interface ListaLancamentosProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function ListaLancamentos({ transactions, onRefresh }: ListaLancamentosProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;

    try {
      const res = await fetch(`/api/lancamentos/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lançamento excluído!");
        onRefresh();
      } else {
        const json = await res.json();
        toast.error(json.error || "Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir lançamento");
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
        <p>Nenhum lançamento encontrado.</p>
        <Link href="/lancamentos/novo" className="mt-2 text-primary hover:underline text-sm">
          Criar primeiro lançamento
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center gap-4 py-3.5 px-1 hover:bg-muted/30 rounded-lg transition-colors">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${t.type === "ENTRADA" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
            {t.type === "ENTRADA" ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{t.description}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: t.category.color + "20", color: t.category.color }}
              >
                {t.category.icon} {t.category.name}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
            </div>
          </div>

          <div className={`text-sm font-semibold tabular-nums ${t.type === "ENTRADA" ? "text-emerald-600" : "text-red-600"}`}>
            {t.type === "ENTRADA" ? "+" : "-"}{formatBRL(Number(t.value))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/lancamentos/${t.id}`)}>
                <Pencil className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(t.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
