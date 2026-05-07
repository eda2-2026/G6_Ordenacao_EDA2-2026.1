"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatDate } from "@/lib/utils/formatters";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

interface Resumo {
  saldo: number;
  totalEntradas: number;
  totalSaidas: number;
  variacaoPercentual: number;
}

interface FluxoItem {
  date: string;
  entradas: number;
  saidas: number;
}

interface CategoriaItem {
  name: string;
  color: string;
  icon: string;
  total: number;
}

interface Transaction {
  id: string;
  type: "ENTRADA" | "SAIDA";
  value: string | number;
  date: string;
  description: string;
  category: { name: string; icon: string; color: string };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [fluxo, setFluxo] = useState<FluxoItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [recentes, setRecentes] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch("/api/dashboard/resumo").then((r) => r.json()),
        fetch("/api/dashboard/fluxo").then((r) => r.json()),
        fetch("/api/dashboard/categorias").then((r) => r.json()),
        fetch("/api/dashboard/recentes").then((r) => r.json()),
      ]);
      if (r1.data) setResumo(r1.data);
      if (r2.data) setFluxo(r2.data);
      if (r3.data) setCategorias(r3.data);
      if (r4.data) setRecentes(r4.data);
    } catch {
      console.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    {
      label: "Saldo atual",
      value: resumo ? formatBRL(resumo.saldo) : "—",
      change: resumo ? `${resumo.variacaoPercentual >= 0 ? "+" : ""}${resumo.variacaoPercentual}%` : "",
      icon: Wallet,
      positive: (resumo?.variacaoPercentual ?? 0) >= 0,
      gradient: true,
    },
    {
      label: "Entradas",
      value: resumo ? formatBRL(resumo.totalEntradas) : "—",
      change: "",
      icon: ArrowUpRight,
      positive: true,
      gradient: false,
    },
    {
      label: "Saídas",
      value: resumo ? formatBRL(resumo.totalSaidas) : "—",
      change: "",
      icon: ArrowDownRight,
      positive: false,
      gradient: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1.5">
          Bem-vindo, {session?.user?.name || "Usuário"}! Aqui está o resumo financeiro.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`relative overflow-hidden transition-all duration-300 hover:shadow-elegant ${stat.gradient ? "bg-gradient-primary text-primary-foreground" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${stat.gradient ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {stat.label}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.gradient ? "bg-white/20" : stat.positive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <Icon className={`h-4 w-4 ${stat.gradient ? "text-white" : stat.positive ? "text-emerald-600" : "text-red-600"}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                {stat.change && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${stat.gradient ? "text-primary-foreground/70" : ""}`}>
                    {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{stat.change}</span>
                    <span className={stat.gradient ? "text-primary-foreground/60" : "text-muted-foreground"}>vs. período anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            {fluxo.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={fluxo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} labelFormatter={(l) => new Date(l).toLocaleDateString("pt-BR")} />
                  <Legend />
                  <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} name="Entradas" dot={false} />
                  <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} name="Saídas" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                {loading ? "Carregando..." : "Sem dados para exibir"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categorias.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={240}>
                  <PieChart>
                    <Pie data={categorias} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {categorias.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categorias.slice(0, 5).map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="truncate">{c.icon} {c.name}</span>
                      </span>
                      <span className="font-medium tabular-nums">{formatBRL(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                {loading ? "Carregando..." : "Sem dados para exibir"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Últimos Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentes.length > 0 ? (
            <div className="divide-y">
              {recentes.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.type === "ENTRADA" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {t.type === "ENTRADA" ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.description}</div>
                    <div className="text-xs text-muted-foreground">{t.category.icon} {t.category.name} · {formatDate(t.date)}</div>
                  </div>
                  <div className={`text-sm font-semibold tabular-nums ${t.type === "ENTRADA" ? "text-emerald-600" : "text-red-600"}`}>
                    {t.type === "ENTRADA" ? "+" : "-"}{formatBRL(Number(t.value))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              {loading ? "Carregando..." : "Nenhum lançamento registrado ainda"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
