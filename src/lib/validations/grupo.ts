import { z } from "zod";

export const grupoSchema = z.object({
  name: z
    .string()
    .min(2, "Nome do grupo deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
});

export const entrarGrupoSchema = z.object({
  inviteCode: z.string().min(1, "Código de convite é obrigatório"),
});

export const alterarRoleSchema = z.object({
  userId: z.string().cuid("ID de usuário inválido"),
  role: z.enum(["ADMIN", "FINANCEIRO", "VISUALIZADOR"]),
});

export const removerMembroSchema = z.object({
  userId: z.string().cuid("ID de usuário inválido"),
});

export type GrupoInput = z.infer<typeof grupoSchema>;
export type EntrarGrupoInput = z.infer<typeof entrarGrupoSchema>;
export type AlterarRoleInput = z.infer<typeof alterarRoleSchema>;
