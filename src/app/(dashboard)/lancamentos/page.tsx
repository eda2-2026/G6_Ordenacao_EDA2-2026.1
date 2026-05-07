"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListaLancamentos from "@/components/lancamentos/ListaLancamentos";
import FiltrosLancamento from "@/components/lancamentos/FiltrosLancamento";
import UploadExtrato from "@/components/lancamentos/UploadExtrato";
import LimparLancamentosDialog from "@/components/lancamentos/LimparLancamentosDialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Filters {
  type?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "value";
  sortOrder?: "asc" | "desc";
  sortAlgo?: "quicksort" | "mergesort" | "radix";
}

export default function LancamentosPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("perPage", "20");
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.sortAlgo) params.set("sortAlgo", filters.sortAlgo);

    try {
      const res = await fetch(`/api/lancamentos?${params}`);
      const json = await res.json();
      if (json.data) setTransactions(json.data);
      if (json.pagination) setPagination(json.pagination);
    } catch {
      console.error("Erro ao carregar lançamentos");
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilter = useCallback((f: Filters) => {
    setFilters(f);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-display">Lançamentos</h1>
          <p className="text-muted-foreground mt-1.5">Gerencie entradas e saídas do seu grupo</p>
        </div>
        <div className="flex items-center gap-3">
          <UploadExtrato onSuccess={fetchTransactions} />
          <LimparLancamentosDialog total={pagination.total} onSuccess={fetchTransactions} />
          <Link href="/lancamentos/novo">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> Novo lançamento
            </Button>
          </Link>
        </div>
      </div>

      <FiltrosLancamento onFilter={handleFilter} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center justify-between">
            Histórico
            <span className="text-sm font-normal text-muted-foreground">
              {pagination.total} lançamento{pagination.total !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ListaLancamentos transactions={transactions} onRefresh={fetchTransactions} />

          {pagination.totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(page - 1)} className="cursor-pointer" />
                  </PaginationItem>
                )}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink onClick={() => setPage(p)} isActive={page === p} className="cursor-pointer">
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {page < pagination.totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(page + 1)} className="cursor-pointer" />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
