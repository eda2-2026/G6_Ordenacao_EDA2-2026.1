import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember, requireRole } from "@/lib/utils/permissions";
import { lancamentoSchema } from "@/lib/validations/lancamento";
import { z } from "zod";

// GET /api/lancamentos/[id] — buscar lançamento por ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "Você precisa pertencer a um grupo" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: params.id, groupId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: transaction });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao buscar lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/lancamentos/[id] — editar lançamento
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "Você precisa pertencer a um grupo" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: params.id, groupId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
    }

    // Owner can edit their own, ADMIN/FINANCEIRO can edit any
    if (transaction.userId !== session.user.id) {
      await requireRole(session.user.id, groupId, ["ADMIN", "FINANCEIRO"]);
    }

    const body = await req.json();
    const data = lancamentoSchema.parse(body);

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        type: data.type,
        value: data.value,
        date: new Date(data.date),
        description: data.description,
        notes: data.notes,
        categoryId: data.categoryId,
        isRecurring: data.isRecurring,
        recurrenceFrequency: data.recurrenceFrequency,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      if (error.message === "Permissão insuficiente") return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    console.error("Erro ao editar lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/lancamentos/[id] — excluir lançamento
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "Você precisa pertencer a um grupo" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id: params.id, groupId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
    }

    if (transaction.userId !== session.user.id) {
      await requireRole(session.user.id, groupId, ["ADMIN", "FINANCEIRO"]);
    }

    await prisma.transaction.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      if (error.message === "Permissão insuficiente") return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Erro ao excluir lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
