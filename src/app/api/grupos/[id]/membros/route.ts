import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember, requireRole } from "@/lib/utils/permissions";
import { alterarRoleSchema, removerMembroSchema } from "@/lib/validations/grupo";
import { z } from "zod";

// GET /api/grupos/[id]/membros — listar membros
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requireGroupMember(session.user.id, params.id);

    const members = await prisma.groupMember.findMany({
      where: { groupId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json({ data: members });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (error.message === "Usuário não pertence a este grupo") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    console.error("Erro ao listar membros:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/grupos/[id]/membros — alterar role (ADMIN only)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requireRole(session.user.id, params.id, ["ADMIN"]);

    const body = await req.json();
    const { userId, role } = alterarRoleSchema.parse(body);

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode alterar sua própria role" },
        { status: 400 }
      );
    }

    const member = await prisma.groupMember.update({
      where: {
        userId_groupId: { userId, groupId: params.id },
      },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: member });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (error.message === "Permissão insuficiente") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Erro ao alterar role:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/grupos/[id]/membros — remover membro (ADMIN only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    await requireRole(session.user.id, params.id, ["ADMIN"]);

    const body = await req.json();
    const { userId } = removerMembroSchema.parse(body);

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode se remover do grupo" },
        { status: 400 }
      );
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: { userId, groupId: params.id },
      },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (error.message === "Permissão insuficiente") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Erro ao remover membro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
