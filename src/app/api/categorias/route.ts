import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/utils/permissions";
import { categoriaSchema } from "@/lib/validations/categoria";
import { z } from "zod";

// GET /api/categorias — categorias padrão + do grupo ativo
export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId") || session.user.groupId;

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true, groupId: null },
          ...(groupId ? [{ groupId }] : []),
        ],
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao listar categorias:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/categorias — criar categoria personalizada (ADMIN only)
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json(
        { error: "Você precisa pertencer a um grupo" },
        { status: 400 }
      );
    }

    await requireRole(session.user.id, groupId, ["ADMIN"]);

    const body = await req.json();
    const data = categoriaSchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
        groupId,
        isDefault: false,
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
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
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
