import { prisma } from "../src/lib/prisma";

async function main() {
  const data = [
    { date: "29/12/2025 – 2/1/2026", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/31/Newsletter+Dec+31.pdf" },
    { date: "22/12/2025 – 26/12/2025", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/24/Newsletter+Dec+24.pdf" },
    { date: "15/12/2025 – 19/12/2025", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/16/Newsletter+Dec+16.pdf" },
    { date: "8/12/2025 – 12/12/2025", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/10/Newsletter+Dec+10.pdf" },
    { date: "1/12/2025 – 7/12/2025", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/december-2025/3/Newsletter+Dec+3.pdf" },
    { date: "24/11/2025 – 28/11/2025", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/november-2025/26/Newsletter+Nov+26.pdf" },
    { date: "17/11/2025 – 21/11/2025", url: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/november-2025/24/Updated+Newsletter+Nov+24.pdf" },
  ];

  try {
    await prisma.newsletter.createMany({
      data: data.map(d => ({
        date: d.date,
        url: d.url,
        active: true,
      })),
    });

    console.log("✅ Seeded newsletters successfully");
  } catch (err) {
    console.error("❌ Error seeding newsletters:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
