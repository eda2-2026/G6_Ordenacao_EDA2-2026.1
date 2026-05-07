"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface FiltrosLancamentoProps {
  onFilter: (filters: {
    type?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: "date" | "value";
    sortOrder?: "asc" | "desc";
    sortAlgo?: "quicksort" | "mergesort" | "radix";
  }) => void;
}

export default function FiltrosLancamento({ onFilter }: FiltrosLancamentoProps) {
  const [type, setType] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "value">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortAlgo, setSortAlgo] = useState<"db" | "quicksort" | "mergesort" | "radix">("db");
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categorias");
      const json = await res.json();
      if (json.data) setCategories(json.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    onFilter({
      type: type || undefined,
      categoryId: categoryId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: sortAlgo === "db" ? undefined : sortBy,
      sortOrder: sortAlgo === "db" ? undefined : sortOrder,
      sortAlgo: sortAlgo === "db" ? undefined : sortAlgo,
    });
  }, [type, categoryId, startDate, endDate, sortBy, sortOrder, sortAlgo, onFilter]);

  function clearFilters() {
    setType("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
    setSortOrder("desc");
    setSortAlgo("db");
  }

  const hasFilters = type || categoryId || startDate || endDate || sortAlgo !== "db";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Tipo</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ENTRADA">Entradas</SelectItem>
            <SelectItem value="SAIDA">Saídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Categoria</label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">De</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[150px]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Até</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[150px]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Ordenar por</label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "value")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Data</SelectItem>
            <SelectItem value="value">Valor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Ordem</label>
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Algoritmo</label>
        <Select value={sortAlgo} onValueChange={(v) => setSortAlgo(v as "db" | "quicksort" | "mergesort" | "radix")}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="db">Banco (padrao)</SelectItem>
            <SelectItem value="quicksort">Quicksort</SelectItem>
            <SelectItem value="mergesort">Mergesort</SelectItem>
            <SelectItem value="radix">Radix</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          <X className="h-4 w-4 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
}
