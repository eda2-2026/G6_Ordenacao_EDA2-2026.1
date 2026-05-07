import { z } from "zod";

export const categoriaSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome muito longo"),
  icon: z.string().min(1, "Ícone é obrigatório").default("💰"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hex válido (#RRGGBB)")
    .default("#1A7F5A"),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
