import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";

const limparSchema = z.object({
  password: z.string().min(8, "Senha inválida"),
});

// POST /api/lancamentos/limpar — excluir todos os lançamentos do grupo
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

    await requireGroupMember(session.user.id, groupId);

    const body = await req.json();
    const { password } = limparSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Sua conta não possui senha cadastrada" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 403 });
    }

    const result = await prisma.transaction.deleteMany({ where: { groupId } });

    return NextResponse.json({ data: { deleted: result.count } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Não autorizado") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
      if (error.message === "Usuário não pertence a este grupo") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Erro ao limpar lançamentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
