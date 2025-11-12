import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newLaunches = [
  {
    title: "Springleaf Residence",
    summary: "The North's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/springleaf-collection.webp",
    location: "Upper Thomson",
    district: "District 26",
    status: "Registration Open",
    type: "Condo",
    bedrooms: "3-5",
    price: "From $2,300,000",
    url: "/springleaf-residence",
    active: true,
  },
  {
    title: "Penrith",
    summary: "The Margaret Drive Address That Brings You Closer to Everything",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/penrith-collection.webp",
    launchDate: "April 2024",
    location: "Queenstown",
    district: "District 3",
    status: "Preview Available",
    type: "Condo",
    bedrooms: "2-5",
    price: "From $1,495,000",
    url: "/penrith",
    active: true,
  },
  {
    title: "Aurea",
    summary: "The Golden Mile's Premier Residential Development",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/hero-aurea.webp",
    launchDate: "May 2024",
    location: "Beach Road",
    district: "District 7",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "2-5",
    price: "From $1,765,000",
    url: "/aurea",
    active: true,
  },
  {
    title: "W Residences Marina View",
    summary: "Embrace liberated luxury with sleek, chic apartments that offer exclusive 5-star W facilities and services.",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/w-residences-collection.webp",
    launchDate: "June 2024",
    location: "Marina View",
    district: "District 1",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "1-5 BR",
    price: "From $1,848,000",
    url: "",
    active: true,
  },
  {
    title: "Arina East Residences",
    summary: "The East Coast's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/arina-east-collection.webp",
    launchDate: "June 2024",
    location: "East Coast",
    district: "District 15",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "1-4",
    price: "From $1,298,000",
    url: "",
    active: true,
  },
  {
    title: "Artisan 8",
    summary: "TBC",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/coming-soon.webp",
    launchDate: "June 2024",
    location: "Sin Ming Road",
    district: "District 20",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "TBC",
    price: "TBC",
    url: "",
    active: true,
  },
];

async function main() {
  console.log('Seeding new launch collection...');
  
  // First, check if data already exists
  const existingCount = await prisma.newLaunch.count();
  
  if (existingCount > 0) {
    console.log('Data already exists, skipping seed...');
    return;
  }
  
  // Create all launches
  for (const launch of newLaunches) {
    await prisma.newLaunch.create({
      data: launch,
    });
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
