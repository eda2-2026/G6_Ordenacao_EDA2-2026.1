"use client";

import { useState, type MouseEvent } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LimparLancamentosDialogProps {
  total: number;
  onSuccess: () => void;
}

export default function LimparLancamentosDialog({
  total,
  onSuccess,
}: LimparLancamentosDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!password) {
      toast.error("Digite sua senha para confirmar");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/lancamentos/limpar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao limpar lançamentos");
        return;
      }

      toast.success(`Foram excluídos ${json.data.deleted} lançamentos.`);
      setPassword("");
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Erro ao limpar lançamentos");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={total === 0}>
          <Trash2 className="h-4 w-4" /> Limpar extrato
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir todo o extrato?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação remove todos os lançamentos do grupo ({total}). Digite sua senha
            para confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || total === 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Excluindo...
              </>
            ) : (
              "Excluir tudo"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
