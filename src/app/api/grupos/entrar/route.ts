import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/utils/permissions";
import { entrarGrupoSchema } from "@/lib/validations/grupo";
import { z } from "zod";

// POST /api/grupos/entrar — entrar em grupo pelo inviteCode
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { inviteCode } = entrarGrupoSchema.parse(body);

    const group = await prisma.group.findUnique({
      where: { inviteCode },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Código de convite inválido" },
        { status: 404 }
      );
    }

    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: group.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Você já pertence a este grupo" },
        { status: 409 }
      );
    }

    const membership = await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "VISUALIZADOR",
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json({ data: membership }, { status: 201 });
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
    console.error("Erro ao entrar no grupo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
