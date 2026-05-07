import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/utils/permissions";
import { categoriaSchema } from "@/lib/validations/categoria";
import { z } from "zod";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const category = await prisma.category.findUnique({ where: { id: params.id } });

    if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    if (category.isDefault) return NextResponse.json({ error: "Categorias padrão não podem ser editadas" }, { status: 403 });
    if (!category.groupId) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

    await requireRole(session.user.id, category.groupId, ["ADMIN"]);
    const body = await req.json();
    const data = categoriaSchema.parse(body);

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: { name: data.name, icon: data.icon, color: data.color },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (error instanceof Error && error.message === "Permissão insuficiente") return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const category = await prisma.category.findUnique({ where: { id: params.id } });

    if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    if (category.isDefault) return NextResponse.json({ error: "Categorias padrão não podem ser desativadas" }, { status: 403 });
    if (!category.groupId) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

    await requireRole(session.user.id, category.groupId, ["ADMIN"]);

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (error instanceof Error && error.message === "Permissão insuficiente") return NextResponse.json({ error: error.message }, { status: 403 });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
