import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }
  return session;
}

export async function requireRole(
  userId: string,
  groupId: string,
  allowedRoles: Role[]
) {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (!membership) {
    throw new Error("Usuário não pertence a este grupo");
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new Error("Permissão insuficiente");
  }

  return membership;
}

export async function requireGroupMember(userId: string, groupId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  if (!membership) {
    throw new Error("Usuário não pertence a este grupo");
  }

  return membership;
}
