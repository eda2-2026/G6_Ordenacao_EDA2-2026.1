import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";
import { extractFromStatement } from "@/lib/gemini";
import { matchCategoryBySuggestion } from "@/lib/utils/categories";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const groupId = session.user.groupId;

    if (!groupId) {
      return NextResponse.json({ error: "Você precisa pertencer a um grupo" }, { status: 400 });
    }

    await requireGroupMember(session.user.id, groupId);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado. Use JPG, PNG, WEBP ou PDF." },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Call Gemini to parse array of transactions
    const extratoData = await extractFromStatement(base64, file.type);
    
    if (!extratoData || extratoData.length === 0) {
      return NextResponse.json({ error: "Nenhuma transação encontrada no documento." }, { status: 422 });
    }

    // Fetch default + group categories
    let categories = await prisma.category.findMany({
      where: {
        OR: [{ isDefault: true, groupId: null }, { groupId }],
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    
    // Create a default category if none exist
    if (categories.length === 0) {
      const newCat = await prisma.category.create({
        data: { name: "Outros", icon: "📁", color: "#64748b", groupId }
      });
      categories = [newCat];
    }
    
    const lancamentosToInsert = extratoData.map(item => {
      const matchedCat = matchCategoryBySuggestion(categories, item.suggestedCategory) || categories[0];

      return {
        type: item.type as "ENTRADA" | "SAIDA",
        value: Number(item.value) || 0,
        date: new Date(item.date),
        description: item.description.substring(0, 255) || "Importação via Extrato",
        notes: item.notes?.substring(0, 500) || "",
        categoryId: matchedCat.id,
        userId: session.user.id,
        groupId: groupId,
      };
    });

    const result = await prisma.transaction.createMany({
      data: lancamentosToInsert,
      skipDuplicates: false,
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro no processamento do extrato:", error);
    return NextResponse.json({ error: "Falha interna ao ler o extrato" }, { status: 500 });
  }
}
