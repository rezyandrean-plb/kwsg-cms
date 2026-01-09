import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toolResources = [
  {
    name: "KW PropSage",
    description: "Handle the entire transaction process smoothly from start to finish, paperwork-free.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-propsage.webp",
    category: "Business Tool",
    url: "app.propsage.com",
    active: true
  },
  {
    name: "KW Command",
    description: "Manage your real estate business easily from anywhere with one central hub.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-command.webp",
    category: "Business Tool",
    url: "agent.kw.com",
    active: true
  },
  {
    name: "KW Contacts",
    description: "Organize leads and contacts intelligently, never forget important follow-ups again.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-contacts.webp",
    category: "Business Tool",
    url: "https://console.command.kw.com/command/contacts",
    active: true
  },
  {
    name: "KW Tasks",
    description: "Track every client's to-do list carefully, ensuring no task gets missed.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tasks.webp",
    category: "Business Tool",
    url: "https://console.command.kw.com/command/task-manager",
    active: true
  },
  {
    name: "KW Campaigns",
    description: "Generate steady social media leads without needing complex ad platform expertise.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-campaigns.webp",
    category: "Business Tool",
    url: "https://campaigns.kw.com/",
    active: true
  },
  {
    name: "KW Opportunities",
    description: "Track deals from new leads to closings, ensuring payments never missed.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-opportunities.webp",
    category: "Business Tool",
    url: "https://console.command.kw.com/command/opportunities",
    active: true
  },
  {
    name: "KW SmartPlans",
    description: "Automate client follow-ups and marketing campaigns, saving time while staying connected.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-smartplans.webp",
    category: "Business Tool",
    url: "https://console.command.kw.com/command/smart-plans",
    active: true
  },
  {
    name: "KW Listings",
    description: "Showcase properties beautifully with professional listing pages that attract serious buyers.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-listings.webp",
    category: "Business Tool",
    url: "https://console.command.kw.com/command/listings",
    active: true
  },
  {
    name: "KW Website",
    description: "Create branded, user-friendly websites in minutes to capture online inquiries.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-website.webp",
    category: "Business Tool",
    url: "https://console.command.kw.com/command/websites",
    active: true
  },
  {
    name: "KW University",
    description: "Access world-class real estate training and mentorship to sharpen skills continuously.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-university.webp",
    category: "Learnings",
    url: "https://agent.kw.com/connect/learning/categories",
    active: true
  },
  {
    name: "Real Insights",
    description: "Get instant, data-driven insights on property value, market trends, and history.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/rea-insights.webp",
    category: "External Tools",
    url: "https://rea-insight.com/",
    active: true
  },
  {
    name: "EdgeProp Inspector",
    description: "Access URA planning, school details, and transaction data quickly, all in one place.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/edgeprop-pro.webp",
    category: "External Tools",
    url: "https://www.edgeprop.sg/analytic/inspector",
    active: true
  },
  {
    name: "KW Canva",
    description: "Design stunning brochures, posts, and materials easily, no design experience required.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-canva.webp",
    category: "Business Tool",
    url: "canva.kw.com",
    active: true
  },
  {
    name: "Squarefoot",
    description: "Easily check recent transaction prices of HDBs, condos, and landed properties to ensure your clients get the best deal.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/squarefoot.webp",
    category: "External Tools",
    url: "squarefoot.com.sg/component/users/login",
    active: true
  },
  {
    name: "SpiderGate DNC Subscription",
    description: "Verify phone numbers instantly against the Do Not Call registry database.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/spidergate.webp",
    category: "External Tools",
    url: "https://drive.google.com/file/d/1GcNpqifBzKSurSmz7qkpIMjrjaVOD1Pm/view",
    active: true
  },
  {
    name: "Sales Proceed",
    description: "Instantly calculate net cash proceeds after property sale and costs.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/sales-proceed.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/sales-proceed",
    active: true
  },
  {
    name: "Timeline Planning",
    description: "Plan key property transaction milestones with clear, date-based scheduling tool.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/timeline-planning.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/timeline-planning",
    active: true
  },
  {
    name: "Decoupling",
    description: "Assess cost and benefits of transferring ownership for future property purchase.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/decoupling.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/decoupling",
    active: true
  },
  {
    name: "Equity Term Loan",
    description: "Estimate how much equity you can unlock through refinancing options.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/equity-term-loan.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/equity-term-loan",
    active: true
  },
  {
    name: "TDSR/MSR",
    description: "Evaluate buyer affordability using government-mandated loan ratio and income guidelines.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/tdsr-msr.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/tdsr-msr",
    active: true
  },
  {
    name: "New Project Purchase (BUC)",
    description: "Project progressive payment schedule for building-under-construction properties before completion.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/buc-calculator.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/buc",
    active: true
  },
  {
    name: "New EC Purchase (BUC)",
    description: "Calculate EC affordability with income ceiling, grant eligibility, and staged payments.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/buc-calculator.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/ec",
    active: true
  },
  {
    name: "Resale Purchase",
    description: "Estimate upfront costs, loan structure, and timeline for resale property purchase.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/buc-calculator.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/timeline-payment",
    active: true
  },
  {
    name: "Mortgage Loan",
    description: "Compute monthly repayments and interest impact based on loan tenure and rates.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/mortgage-loan.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/mortgage-loan",
    active: true
  },
  {
    name: "Pledge/Unpledge",
    description: "Assess affordability impact when pledging or unpledging funds for property loan.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/pledge-unpledge.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/pledge-unpledge",
    active: true
  },
  {
    name: "ABSD/BSD",
    description: "Calculate Buyer's and Additional Buyer's Stamp Duties for property transactions.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/absd-bsd.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/absd-bsd",
    active: true
  },
  {
    name: "SSD",
    description: "Determine payable Seller's Stamp Duty based on property holding duration and rules.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/ssd.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/ssd",
    active: true
  },
  {
    name: "Rental Stamp Duty",
    description: "Instantly compute rental stamp duty payable on signed tenancy agreements.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/rental-stamp-duty.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/rental-stamp-duty",
    active: true
  },
  {
    name: "Compass10",
    description: "Smart Property Scoring Framework condenses investment potential into one intuitive visual chart.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/compass-10.webp",
    category: "Compass Tools",
    url: "https://compass.kwsingapore.com/tech-tools/compass-10",
    active: true
  },
  {
    name: "Supply & Demand Analysis",
    description: "Aggregates market activity data to reveal real-time property demand and supply trends.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/supply-demand-analysis.webp",
    category: "Compass Tools",
    url: "https://compass.kwsingapore.com/tech-tools/supply-demand-analysis",
    active: true
  },
  {
    name: "Property Analysis",
    description: "Your All-In-One Property Deep Dive — Every Detail, Every Metric",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/property-analysis.webp",
    category: "Compass Tools",
    url: "https://compass.kwsingapore.com/tech-tools/property-analysis/research",
    active: true
  },
  {
    name: "Disparity Effect",
    description: "Analyse property price gaps across different markets through charts to identify undervalued opportunities.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/disparity-effect.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/tech-tools/disparity-effect/charts?type=all",
    active: true
  },
  {
    name: "Property Comparison",
    description: "Compare multiple properties side-by-side using price, size, and yield metrics.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/buc-calculator.webp",
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculator/property-comparison",
    active: true
  },
  {
    name: "Research Chart Mega Vault",
    description: "Compare BUC vs Resale financial outlays, analysing own-stay versus investment.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/research-charts.webp",
    category: "Compass Tools",
    url: "https://drive.google.com/drive/u/2/folders/16cpLVQWIGSmdsat2f9XONQkDbOESYV0m",
    active: true
  },
  {
    name: "Training Recording: KW PropTech Calculator, EdgeProp Inspector, Real Insights, etc.",
    description: "Learn PropTech calculators, EdgeProp Inspector, and Real Insights through recorded training.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://www.youtube.com/playlist?list=PLLAXUUZdAmAqEH3-QDXlGc4Opm9i3lGa0",
    active: true
  },
  {
    name: "Training Recording: KW PropSage Deal Submission",
    description: "Watch step-by-step process for submitting and managing deals using PropSage.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://www.youtube.com/playlist?list=PLLAXUUZdAmAoqtN5dPkjshZgUhF735R9x",
    active: true
  },
  {
    name: "Video Guide: KW Command",
    description: "Get a visual walkthrough of KW Command's main tools and features.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://www.youtube.com/playlist?list=PLLAXUUZdAmAr-TbCVIjwGGCItRE-mQ3Vg",
    active: true
  },
  {
    name: "Step-by-step Guide: KW Command",
    description: "Follow detailed written steps to navigate KW Command confidently and effectively.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://answers.kw.com/hc/en-us/categories/26283417706515-Command",
    active: true
  },
  {
    name: "Step-by-step Guide: KW Command Mobile App",
    description: "Master KW Command mobile app functions with clear, easy instructions provided.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://answers.kw.com/hc/en-us/categories/4402619174931-Command-App",
    active: true
  },
  {
    name: "Step-by-step Guide: Real Insights",
    description: "Leverage Real Insights step-by-step for effective property research and analysis.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://drive.google.com/file/d/1YkRJJebAJhWilzd2mvTMwMGbIvzvBzWY/view?usp=drive_link",
    active: true
  },
  {
    name: "Step-by-step Guide: Real Insights Valuation Report",
    description: "Generate and interpret valuation reports from Real Insights with simple steps.",
    icon: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/kw-tutorial.webp",
    category: "Learnings",
    url: "https://drive.google.com/file/d/1KnOVVO_2YtvDta0vS_t0nxCIlo1K0AK3/view?usp=drive_link",
    active: true
  }
];

async function main() {
  console.log('Seeding tool resources...');
  
  // First, check if data already exists
  const existingCount = await prisma.toolResource.count();
  
  if (existingCount > 0) {
    console.log('Data already exists, skipping seed...');
    return;
  }
  
  // Create all tool resources
  for (const tool of toolResources) {
    await prisma.toolResource.create({
      data: tool,
    });
  }
  
  console.log(`Seeding completed! Inserted ${toolResources.length} tool resources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

