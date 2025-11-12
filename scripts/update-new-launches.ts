import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newLaunches = [
  {
    id: 1,
    title: "Springleaf Residence",
    summary: "The North's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/springleaf-collection.webp",
    location: "Upper Thomson",
    district: "District 26",
    status: "Launched",
    type: "Condo",
    bedrooms: "3-5",
    price: "From $2,300,000",
    url: "/springleaf-residence",
  },
  {
    id: 2,
    title: "Penrith",
    summary: "The Margaret Drive Address That Brings You Closer to Everything",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/penrith-collection.webp",
    launchDate: "April 2024",
    location: "Queenstown",
    district: "District 3",
    status: "Launched",
    type: "Condo",
    bedrooms: "2-5",
    price: "From $1,495,000",
    url: "/penrith",
  },
  {
    id: 3,
    title: "Aurea",
    summary: "The Golden Mile's Premier Residential Development",
    image: "/images/aurea/hero-aurea.webp",
    launchDate: "May 2024",
    location: "Beach Road",
    district: "District 7",
    status: "Launched",
    type: "Condo",
    bedrooms: "2-5",
    price: "From $1,765,000",
    url: "/aurea",
  },
  {
    id: 4,
    title: "W Residences Marina View",
    summary: "Embrace liberated luxury with sleek, chic apartments that offer exclusive 5-star W facilities and services.",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/w-residences-collection.webp",
    launchDate: "June 2024",
    location: "Marina View",
    district: "District 1",
    status: "Launched",
    type: "Condo",
    bedrooms: "1-5 BR",
    price: "From $1,848,000",
    url: "/w-residences",
  },
  {
    id: 5,
    title: "Arina East Residences",
    summary: "The East Coast's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/arina-east-collection.webp",
    launchDate: "June 2024",
    location: "East Coast",
    district: "District 15",
    status: "Launched",
    type: "Condo",
    bedrooms: "1-4",
    price: "From $1,298,000",
    url: "/arina-east",
  },
  {
    id: 6,
    title: "Artisan 8",
    summary: "Exceptionally Crafted Homes With Enduring Value",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/artisan-8-collection.webp",
    launchDate: "Q2 2027",
    location: "Sin Ming",
    district: "District 20",
    status: "Launched",
    type: "Condo",
    bedrooms: "1-5",
    price: "From $1,292,000",
    url: "/artisan-8",
  },
  {
    id: 7,
    title: "Orchard Sophia",
    summary: "The Pinnacle of Contemporary Living in the City",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/mega-landing-page/orchard-sophia/orchard-sophia-hero.jpg",
    location: "Sophia Road",
    district: "District 9",
    status: "Launched",
    type: "Condo",
    bedrooms: "2",
    price: "From $1,593,000",
    url: "/orchard-sophia",
  },
];

async function main() {
  console.log('Updating new launch collection...');
  
  try {
    // Delete all existing records
    const deleteResult = await prisma.newLaunch.deleteMany({});
    console.log(`Deleted ${deleteResult.count} existing records`);
    
    // Reset the sequence to start from 1
    await prisma.$executeRaw`ALTER SEQUENCE new_launch_collection_id_seq RESTART WITH 1`;
    
    // Insert new records with explicit IDs using raw SQL
    for (const launch of newLaunches) {
      await prisma.$executeRaw`
        INSERT INTO new_launch_collection (
          id, title, summary, image, location, district, status, 
          type, bedrooms, price, url, "launchDate", visibility, active, 
          "createdAt", "updatedAt"
        ) VALUES (
          ${launch.id},
          ${launch.title},
          ${launch.summary ?? null},
          ${launch.image ?? null},
          ${launch.location},
          ${launch.district},
          ${launch.status},
          ${launch.type ?? null},
          ${launch.bedrooms ?? null},
          ${launch.price ?? null},
          ${launch.url ?? null},
          ${launch.launchDate ?? null},
          'Show',
          true,
          NOW(),
          NOW()
        )
      `;
      console.log(`Inserted: ${launch.title} (ID: ${launch.id})`);
    }
    
    // Set the sequence to continue from the highest ID
    await prisma.$executeRaw`SELECT setval('new_launch_collection_id_seq', (SELECT MAX(id) FROM new_launch_collection))`;
    
    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error updating new launches:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

