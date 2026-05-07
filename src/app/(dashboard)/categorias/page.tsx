"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FormCategoria from "@/components/categorias/FormCategoria";
import CategoriaTag from "@/components/categorias/CategoriaTag";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<{ id: string; name: string; icon: string; color: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categorias");
      const json = await res.json();
      if (json.data) setCategories(json.data);
    } catch {
      console.error("Erro ao carregar categorias");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleDeactivate(id: string) {
    if (!confirm("Deseja desativar esta categoria?")) return;
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Categoria desativada!");
        fetchCategories();
      } else {
        const json = await res.json();
        toast.error(json.error || "Erro ao desativar");
      }
    } catch {
      toast.error("Erro ao desativar categoria");
    }
  }

  function openEdit(cat: Category) {
    setEditData({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color });
    setModalOpen(true);
  }

  function openCreate() {
    setEditData(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-display">Categorias</h1>
          <p className="text-muted-foreground mt-1.5">Gerencie as categorias do seu grupo</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nova categoria
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id} className={`transition-all duration-200 hover:shadow-elegant ${!cat.isActive ? "opacity-50" : ""}`}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: cat.color + "20" }}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{cat.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.isDefault ? "Padrão" : "Personalizada"}
                  {!cat.isActive && " · Desativada"}
                </div>
              </div>
              {!cat.isDefault && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {cat.isActive && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeactivate(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <FormCategoria open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchCategories} editData={editData} />
    </div>
  );
}
