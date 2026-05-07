import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";
import type { Prisma } from "@prisma/client";

// GET /api/dashboard/resumo — saldo, entradas, saídas, variação
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

    const dateFilter: Prisma.TransactionWhereInput = {
      groupId,
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [entradas, saidas] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...dateFilter, type: "ENTRADA" },
        _sum: { value: true },
      }),
      prisma.transaction.aggregate({
        where: { ...dateFilter, type: "SAIDA" },
        _sum: { value: true },
      }),
    ]);

    const totalEntradas = Number(entradas._sum.value || 0);
    const totalSaidas = Number(saidas._sum.value || 0);
    const saldo = totalEntradas - totalSaidas;

    // Calculate variation vs previous period
    let variacaoPercentual = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const periodMs = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - periodMs);
      const prevEnd = new Date(start);

      const [prevEntradas, prevSaidas] = await Promise.all([
        prisma.transaction.aggregate({
          where: { groupId, type: "ENTRADA", date: { gte: prevStart, lt: prevEnd } },
          _sum: { value: true },
        }),
        prisma.transaction.aggregate({
          where: { groupId, type: "SAIDA", date: { gte: prevStart, lt: prevEnd } },
          _sum: { value: true },
        }),
      ]);

      const prevSaldo = Number(prevEntradas._sum.value || 0) - Number(prevSaidas._sum.value || 0);
      if (prevSaldo !== 0) {
        variacaoPercentual = Math.round(((saldo - prevSaldo) / Math.abs(prevSaldo)) * 100);
      }
    }

    return NextResponse.json({
      data: { saldo, totalEntradas, totalSaidas, variacaoPercentual },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao buscar resumo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
