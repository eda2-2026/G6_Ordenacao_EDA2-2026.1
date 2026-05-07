import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/utils/permissions";
import { grupoSchema } from "@/lib/validations/grupo";
import { z } from "zod";

// GET /api/grupos — listar grupos do usuário
export async function GET() {
  try {
    const session = await requireAuth();

    const memberships = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true, transactions: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const data = memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      inviteCode: m.group.inviteCode,
      role: m.role,
      joinedAt: m.joinedAt,
      membersCount: m.group._count.members,
      transactionsCount: m.group._count.transactions,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao listar grupos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/grupos — criar grupo
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = grupoSchema.parse(body);

    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json({ data: group }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Erro ao criar grupo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
