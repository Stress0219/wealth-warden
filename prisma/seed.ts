import { PrismaClient, TransactionType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  //Limpieza segura (solo para desarrollo)
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("DB limpia.");

  //Usuario principal
  const joan = await prisma.user.create({
    data: {
      email: "joan@wealthwarden.dev",
      name: "Joan",
    },
  });
  console.log(`Usuario: ${joan.email}`);

  // Categorías base
  await prisma.category.createMany({
    data: [
      { name: "Salario" },
      { name: "Alimentación" },
      { name: "Transporte" },
      { name: "Ahorro" },
    ],
  });

  // Recuperamos IDs para enlazar transacciones
  const cats = await prisma.category.findMany();
  const getCat = (name: string) =>
    cats.find((c: { name: string }) => c.name === name)!.id;

  // Transacciones de ejemplo
  await prisma.transaction.createMany({
    data: [
      {
        amount: 2500.0,
        type: TransactionType.INCOME,
        description: "Nómina mensual",
        date: new Date("2026-04-01"),
        userId: joan.id,
        categoryId: getCat("Salario"),
      },
      {
        amount: 45.5,
        type: TransactionType.EXPENSE,
        description: "Supermercado semanal",
        date: new Date("2026-04-05"),
        userId: joan.id,
        categoryId: getCat("Alimentación"),
      },
      {
        amount: 12.0,
        type: TransactionType.EXPENSE,
        description: "Transporte público",
        date: new Date("2026-04-06"),
        userId: joan.id,
        categoryId: getCat("Transporte"),
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
