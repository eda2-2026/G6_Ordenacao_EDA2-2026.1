import { NextResponse } from "next/server";
import { requireAuth, requireGroupMember } from "@/lib/utils/permissions";
import { extractFromImage } from "@/lib/gemini";

// POST /api/ia/extrair — receber imagem e extrair dados via Gemini
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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado. Use JPG, PNG, WEBP ou PDF." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 10MB." },
        { status: 400 }
      );
    }

    // Convert to base64 — process in memory, never store (LGPD)
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Call Gemini with 15s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const result = await extractFromImage(base64, file.type);
      clearTimeout(timeout);

      return NextResponse.json({ data: result });
    } catch (aiError) {
      clearTimeout(timeout);

      if (aiError instanceof Error && aiError.name === "AbortError") {
        return NextResponse.json(
          { error: "Tempo esgotado ao analisar o comprovante" },
          { status: 504 }
        );
      }

      console.error("Erro na extração por IA:", aiError);
      return NextResponse.json(
        { error: "Não foi possível extrair os dados do comprovante" },
        { status: 422 }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Não autorizado") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
