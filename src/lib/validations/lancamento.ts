import { z } from "zod";

export const lancamentoSchema = z.object({
  type: z.enum(["ENTRADA", "SAIDA"]),
  value: z.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data inválida"),
  description: z
    .string()
    .min(3, "Descrição deve ter pelo menos 3 caracteres")
    .max(255, "Descrição muito longa"),
  notes: z.string().max(500, "Observações muito longas").optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z
    .enum(["DIARIA", "SEMANAL", "MENSAL"])
    .optional(),
});

export type LancamentoInput = z.infer<typeof lancamentoSchema>;
