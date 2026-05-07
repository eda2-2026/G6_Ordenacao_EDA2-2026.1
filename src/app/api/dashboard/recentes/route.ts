import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";

// GET /api/dashboard/recentes — últimos 5 lançamentos
export async function GET() {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "Você precisa pertencer a um grupo" }, { status: 400 });
    }

    await requireGroupMember(session.user.id, groupId);

    const transactions = await prisma.transaction.findMany({
      where: { groupId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    });

    return NextResponse.json({ data: transactions });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao buscar recentes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
