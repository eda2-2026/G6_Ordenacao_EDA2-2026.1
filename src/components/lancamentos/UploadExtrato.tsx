"use client";

import { useState } from "react";
import { UploadCloud, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UploadExtratoProps {
  onSuccess: () => void;
}

export default function UploadExtrato({ onSuccess }: UploadExtratoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  async function handleUpload(file: File) {
    if (!file) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ia/extrato", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao processar extrato");
        return;
      }

      toast.success(`${json.count} lançamentos foram importados com sucesso!`);
      setIsOpen(false);
      onSuccess();
      router.refresh();
    } catch (error) {
      toast.error("Erro interno ao ler documento");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed border-2 hover:border-primary/50 hover:bg-primary/5">
          <Sparkles className="h-4 w-4 mr-2 text-primary" /> Inteligência Artificial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Ler Extrato Bancário
          </DialogTitle>
          <DialogDescription>
            Envie o PDF ou Foto de um extrato. Nossa IA fará a varredura e lançará as transações de PIX e Cartão automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Extraindo lançamentos...</p>
                <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos dependendo do tamanho da fatura.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Arraste a fatura ou clique aqui</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Suporta PDF, JPG ou PNG (Máx 10MB)
              </p>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleChange}
                disabled={isLoading}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
