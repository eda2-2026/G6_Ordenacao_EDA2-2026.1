"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoriaSchema, type CategoriaInput } from "@/lib/validations/categoria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
  "#84cc16", "#e11d48",
];

interface FormCategoriaProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: { id: string; name: string; icon: string; color: string } | null;
}

export default function FormCategoria({ open, onClose, onSaved, editData }: FormCategoriaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(editData?.color || "#1A7F5A");

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<CategoriaInput>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: editData || { name: "", icon: "💰", color: "#1A7F5A" },
  });

  async function onSubmit(data: CategoriaInput) {
    setIsLoading(true);
    try {
      const url = editData ? `/api/categorias/${editData.id}` : "/api/categorias";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Erro ao salvar");
        return;
      }

      toast.success(editData ? "Categoria atualizada!" : "Categoria criada!");
      reset();
      onSaved();
      onClose();
    } catch {
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editData ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nome</Label>
            <Input id="cat-name" placeholder="Ex: Marketing" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-icon">Emoji / Ícone</Label>
            <Input id="cat-icon" placeholder="💰" maxLength={4} {...register("icon")} className="w-24 text-center text-2xl" />
            {errors.icon && <p className="text-xs text-destructive">{errors.icon.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setSelectedColor(c); setValue("color", c); }}
                  className={`h-8 w-8 rounded-full transition-all ${selectedColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Input type="text" placeholder="#1A7F5A" {...register("color")} className="w-32 mt-2 font-mono text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editData ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
