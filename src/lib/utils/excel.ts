import * as XLSX from "xlsx";

interface ExcelTransaction {
  date: string;
  description: string;
  categoryName: string;
  type: "ENTRADA" | "SAIDA";
  value: number;
  userName: string;
  notes?: string;
}

interface ExcelData {
  groupName: string;
  period: string;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  transactions: ExcelTransaction[];
}

function formatDateExcel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function gerarExcel(data: ExcelData): Buffer {
  const wb = XLSX.utils.book_new();

  // Sheet 1 - Resumo
  const resumoData = [
    ["KONTA — Relatório Financeiro"],
    ["Grupo", data.groupName],
    ["Período", data.period],
    [],
    ["Resumo Financeiro"],
    ["Total Entradas", data.totalEntradas],
    ["Total Saídas", data.totalSaidas],
    ["Saldo", data.saldo],
    [],
    [`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`],
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
  // Set column widths
  wsResumo["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // Sheet 2 - Lançamentos
  const lancamentosHeader = [
    "Data",
    "Descrição",
    "Categoria",
    "Tipo",
    "Valor (R$)",
    "Responsável",
    "Observações",
  ];

  const lancamentosData = data.transactions.map((t) => [
    formatDateExcel(t.date),
    t.description,
    t.categoryName,
    t.type === "ENTRADA" ? "Entrada" : "Saída",
    t.value,
    t.userName,
    t.notes || "",
  ]);

  const wsLancamentos = XLSX.utils.aoa_to_sheet([
    lancamentosHeader,
    ...lancamentosData,
  ]);
  wsLancamentos["!cols"] = [
    { wch: 12 },
    { wch: 35 },
    { wch: 18 },
    { wch: 10 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLancamentos, "Lançamentos");

  // Sheet 3 - Por Categoria
  const categoryMap = new Map<
    string,
    { entradas: number; saidas: number; count: number }
  >();

  for (const t of data.transactions) {
    const existing = categoryMap.get(t.categoryName) || {
      entradas: 0,
      saidas: 0,
      count: 0,
    };
    if (t.type === "ENTRADA") {
      existing.entradas += t.value;
    } else {
      existing.saidas += t.value;
    }
    existing.count += 1;
    categoryMap.set(t.categoryName, existing);
  }

  const categoryHeader = [
    "Categoria",
    "Qtd. Lançamentos",
    "Total Entradas (R$)",
    "Total Saídas (R$)",
    "Saldo (R$)",
  ];
  const categoryRows = Array.from(categoryMap.entries()).map(
    ([name, stats]) => [
      name,
      stats.count,
      stats.entradas,
      stats.saidas,
      stats.entradas - stats.saidas,
    ]
  );

  const wsCategorias = XLSX.utils.aoa_to_sheet([
    categoryHeader,
    ...categoryRows,
  ]);
  wsCategorias["!cols"] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCategorias, "Por Categoria");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return buffer as Buffer;
}

export type { ExcelData, ExcelTransaction };
