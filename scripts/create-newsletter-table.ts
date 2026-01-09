import { prisma } from '../src/lib/prisma';

async function createNewsletterTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."newsletter" (
        "id" SERIAL NOT NULL,
        "date" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "newsletter_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Newsletter table created successfully!');
  } catch (error) {
    console.error('❌ Error creating newsletter table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createNewsletterTable();
