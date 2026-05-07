import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";
import { gerarExcel } from "@/lib/utils/excel";
import type { ExcelTransaction } from "@/lib/utils/excel";

// GET /api/relatorios/excel — gerar relatório em Excel
export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "Você precisa pertencer a um grupo" }, { status: 400 });
    }

    await requireGroupMember(session.user.id, groupId);

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");

    const dateFilter = startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {};

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        groupId,
        ...dateFilter,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    const totalEntradas = transactions
      .filter((t) => t.type === "ENTRADA")
      .reduce((sum, t) => sum + Number(t.value), 0);
    const totalSaidas = transactions
      .filter((t) => t.type === "SAIDA")
      .reduce((sum, t) => sum + Number(t.value), 0);

    const excelTransactions: ExcelTransaction[] = transactions.map((t) => ({
      date: t.date.toISOString(),
      description: t.description,
      categoryName: t.category.name,
      type: t.type,
      value: Number(t.value),
      userName: t.user.name,
      notes: t.notes || undefined,
    }));

    const periodStr = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString("pt-BR")} — ${new Date(endDate).toLocaleDateString("pt-BR")}`
      : "Todos os períodos";

    const buffer = gerarExcel({
      groupName: group?.name || "Grupo",
      period: periodStr,
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      transactions: excelTransactions,
    });

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio-konta-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao gerar Excel:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório Excel" }, { status: 500 });
  }
}
