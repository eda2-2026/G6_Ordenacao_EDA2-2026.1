import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";

// GET /api/dashboard/fluxo — fluxo de caixa agrupado por dia
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

    // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const transactions = await prisma.transaction.findMany({
      where: {
        groupId,
        date: { gte: start, lte: end },
      },
      select: { date: true, type: true, value: true },
      orderBy: { date: "asc" },
    });

    // Group by date
    const fluxoMap = new Map<string, { date: string; entradas: number; saidas: number }>();

    for (const t of transactions) {
      const dateKey = t.date.toISOString().split("T")[0];
      const existing = fluxoMap.get(dateKey) || { date: dateKey, entradas: 0, saidas: 0 };

      if (t.type === "ENTRADA") {
        existing.entradas += Number(t.value);
      } else {
        existing.saidas += Number(t.value);
      }

      fluxoMap.set(dateKey, existing);
    }

    const data = Array.from(fluxoMap.values());

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao buscar fluxo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
