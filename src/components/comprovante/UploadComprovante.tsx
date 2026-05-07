"use client";

import { useState, useRef, type DragEvent } from "react";
import { Upload, Camera, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExtractionResult {
  type: "ENTRADA" | "SAIDA";
  value: number;
  date: string;
  description: string;
  establishment: string;
  suggestedCategory: string;
}

interface UploadComprovanteProps {
  onExtracted: (data: ExtractionResult) => void;
}

export default function UploadComprovante({ onExtracted }: UploadComprovanteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WEBP ou PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setSelectedFile(null);
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function analyzeWithAI() {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/ia/extrair", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao analisar comprovante");
        return;
      }

      toast.success("Dados extraídos com sucesso!");
      onExtracted(json.data);
    } catch {
      toast.error("Erro ao analisar comprovante");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">Arraste uma imagem ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP ou PDF (máx. 10MB)</p>

          <div className="flex gap-2 mt-4">
            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Selecionar arquivo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-xl border overflow-hidden bg-muted/30">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full max-h-72 object-contain" />
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-sm text-muted-foreground">📄 {fileName}</p>
              </div>
            )}
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Analyze button */}
          <Button
            onClick={analyzeWithAI}
            disabled={isAnalyzing}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando comprovante...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisar com IA
              </>
            )}
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
