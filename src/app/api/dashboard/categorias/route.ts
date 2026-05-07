import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";

// GET /api/dashboard/categorias — total por categoria para PieChart
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

    const dateFilter = startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {};

    const result = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { groupId, type: "SAIDA", ...dateFilter },
      _sum: { value: true },
    });

    const categoryIds = result.map((r) => r.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const data = result.map((r) => {
      const cat = categoryMap.get(r.categoryId);
      return {
        categoryId: r.categoryId,
        name: cat?.name || "Sem categoria",
        color: cat?.color || "#6b7280",
        icon: cat?.icon || "💰",
        total: Number(r._sum.value || 0),
      };
    }).sort((a, b) => b.total - a.total);

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao buscar categorias do dashboard:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
