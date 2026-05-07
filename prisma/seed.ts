import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default categories (global, no groupId)
  const defaultCategories = [
    { name: "Alimentação", icon: "🍽️", color: "#f59e0b", isDefault: true },
    { name: "Transporte", icon: "🚗", color: "#3b82f6", isDefault: true },
    { name: "Salário", icon: "💼", color: "#10b981", isDefault: true },
    { name: "Fornecedores", icon: "📦", color: "#8b5cf6", isDefault: true },
    { name: "Impostos", icon: "🏛️", color: "#ef4444", isDefault: true },
    { name: "Cartao de Credito", icon: "💳", color: "#0ea5e9", isDefault: true },
    { name: "Cartao de Debito", icon: "🏧", color: "#22c55e", isDefault: true },
    { name: "Pix", icon: "⚡", color: "#14b8a6", isDefault: true },
    { name: "Outros", icon: "💰", color: "#6b7280", isDefault: true },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { id: `default-${cat.name.toLowerCase().replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `default-${cat.name.toLowerCase().replace(/\s/g, "-")}`,
        ...cat,
      },
    });
  }

  console.log("✅ Default categories seeded");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
