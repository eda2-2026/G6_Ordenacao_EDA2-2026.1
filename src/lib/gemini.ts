import { GoogleGenerativeAI } from "@google/generative-ai";

const EXTRACTION_PROMPT = `
Analise este comprovante/nota fiscal e retorne um JSON com exatamente este formato:
{
  "type": "ENTRADA" | "SAIDA",
  "value": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "establishment": "string",
  "suggestedCategory": "Alimentação" | "Transporte" | "Salário" | "Fornecedores" | "Impostos" | "Cartao de Credito" | "Cartao de Debito" | "Pix" | "Outros"
}

Regras:
- Se for um pagamento, despesa ou compra, o type é "SAIDA"
- Se for um recebimento, depósito ou crédito, o type é "ENTRADA"
- O value deve ser o valor numérico sem símbolo de moeda
- A date deve estar no formato YYYY-MM-DD
- A description deve ser uma descrição curta da transação
- O establishment deve ser o nome do estabelecimento ou remetente/destinatário
- A suggestedCategory deve ser uma das opções listadas acima, baseada no conteúdo
- Se não tiver certeza da categoria, use "Outros"

Retorne apenas o JSON, sem explicações, sem markdown, sem blocos de código.
`;

export interface ExtractionResult {
  type: "ENTRADA" | "SAIDA";
  value: number;
  date: string;
  description: string;
  establishment: string;
  suggestedCategory: string;
}

export async function extractFromImage(
  imageBase64: string,
  mimeType: string
): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: EXTRACTION_PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  });

  const responseText = result.response.text().trim();

  try {
    const parsed = JSON.parse(responseText) as ExtractionResult;

    // Validate required fields
    if (!parsed.type || !parsed.value || !parsed.date || !parsed.description) {
      console.error("Dados extraídos incompletos:", parsed);
      throw new Error("Dados extraídos incompletos");
    }

    return parsed;
  } catch (error) {
    console.error("Falha ao fazer parse do JSON. Resposta bruta da IA:", responseText);
    
    // Fallback: tentar regex caso o responseMimeType tenha falhado ou a IA colocou markdown block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const fallbackParsed = JSON.parse(jsonMatch[0]) as ExtractionResult;
        return fallbackParsed;
      } catch (fallbackError) {
        throw new Error("Resposta da IA não contém JSON válido");
      }
    }

    throw new Error("Resposta da IA não contém JSON válido");
  }
}

const STATEMENT_PROMPT = `
Analise este extrato bancário ou fatura de cartão e retorne uma LISTA (Array) JSON com todas as transações encontradas.
A saída deve ser EXATAMENTE um Array JSON neste formato:
[
  {
    "type": "ENTRADA" | "SAIDA",
    "value": number,
    "date": "YYYY-MM-DD",
    "description": "string",
    "notes": "string",
    "suggestedCategory": "Alimentação" | "Transporte" | "Salário" | "Fornecedores" | "Impostos" | "Cartao de Credito" | "Cartao de Debito" | "Pix" | "Outros"
  }
]

Regras:
- Se for PIX enviado, TED enviada, DOC, débito, boleto pago, compra no crédito, tarifa, o type é "SAIDA"
- Se for PIX recebido, TED recebida, salário, crédito em conta, estorno, o type é "ENTRADA"
- O value deve ser o valor numérico sempre POSITIVO
- A date deve estar no formato YYYY-MM-DD
- A description deve ser o nome do estabelecimento ou origem/destino da transação
- No campo notes, identifique o método de pagamento (Ex: "PIX", "Cartão de Crédito", "Tarifa Bancária") e dados extras que julgar úteis.
- A suggestedCategory deve ser uma das opções listadas acima.
- Se não tiver certeza da categoria, use "Outros".
- Retorne apenas o Array JSON com colchetes [] e seu conteúdo, sem explicações.
`;

export async function extractFromStatement(
  imageBase64: string,
  mimeType: string
): Promise<ExtractionResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: STATEMENT_PROMPT },
        ],
      },
    ],
    generationConfig: { temperature: 0.1 },
  });

  const responseText = result.response.text().trim();

  try {
    let parsed: ExtractionResult[];
    
    // Tentativa direta
    if (responseText.startsWith("[")) {
      parsed = JSON.parse(responseText) as ExtractionResult[];
    } else {
      // Fallback via Regex para array
      const match = responseText.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Array JSON não encontrado na resposta");
      parsed = JSON.parse(match[0]) as ExtractionResult[];
    }

    // Filtrar apenas o que tem o mínimo de qualidade
    const valid = parsed.filter(t => t.type && t.value && t.date && t.description);
    return valid;
  } catch (e) {
    console.error("Falha ao parsear array do extrato:", responseText);
    throw new Error("Resposta da IA para extrato inválida");
  }
}

