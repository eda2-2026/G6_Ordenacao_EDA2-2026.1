import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember, requireRole } from "@/lib/utils/permissions";
import { grupoSchema } from "@/lib/validations/grupo";
import { z } from "zod";

// GET /api/grupos/[id] — detalhes do grupo
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requireGroupMember(session.user.id, params.id);

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: { transactions: true, categories: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Grupo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: group });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (error.message === "Usuário não pertence a este grupo") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Erro ao buscar grupo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/grupos/[id] — editar grupo (ADMIN only)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requireRole(session.user.id, params.id, ["ADMIN"]);

    const body = await req.json();
    const data = grupoSchema.parse(body);

    const group = await prisma.group.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return NextResponse.json({ data: group });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (
        error.message === "Permissão insuficiente" ||
        error.message === "Usuário não pertence a este grupo"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Erro ao editar grupo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
