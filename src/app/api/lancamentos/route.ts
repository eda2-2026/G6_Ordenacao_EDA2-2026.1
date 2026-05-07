import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember, requireRole } from "@/lib/utils/permissions";
import { lancamentoSchema } from "@/lib/validations/lancamento";
import { sortTransactions, type SortAlgorithm, type SortKey, type SortOrder } from "@/lib/utils/sorting";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

// GET /api/lancamentos — listagem paginada com filtros
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("perPage") || "20")));
    const type = searchParams.get("type") as "ENTRADA" | "SAIDA" | null;
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");
    const sortAlgoParam = searchParams.get("sortAlgo");
    const sortByParam = searchParams.get("sortBy");
    const sortOrderParam = searchParams.get("sortOrder");

    const sortAlgo: SortAlgorithm | null =
      sortAlgoParam === "quicksort" || sortAlgoParam === "mergesort" || sortAlgoParam === "radix"
        ? sortAlgoParam
        : null;
    const sortBy: SortKey = sortByParam === "value" ? "value" : "date";
    const sortOrder: SortOrder = sortOrderParam === "asc" ? "asc" : "desc";

    const where: Prisma.TransactionWhereInput = {
      groupId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(userId && { userId }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    if (sortAlgo) {
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          user: { select: { id: true, name: true } },
        },
      });

      const sorted = sortTransactions(transactions, {
        algorithm: sortAlgo,
        key: sortBy,
        order: sortOrder,
      });

      const total = sorted.length;
      const start = (page - 1) * perPage;
      const data = sorted.slice(start, start + perPage);

      return NextResponse.json({
        data,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro ao listar lançamentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/lancamentos — criar lançamento
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

    await requireRole(session.user.id, groupId, ["ADMIN", "FINANCEIRO"]);

    const body = await req.json();
    const data = lancamentoSchema.parse(body);

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        value: data.value,
        date: new Date(data.date),
        description: data.description,
        notes: data.notes,
        categoryId: data.categoryId,
        isRecurring: data.isRecurring,
        recurrenceFrequency: data.recurrenceFrequency,
        userId: session.user.id,
        groupId,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: transaction }, { status: 201 });
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
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
