"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";

interface PropTech {
  id: number;
  name: string;
  description: string;
  icon?: string;
  category: string;
  url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Real Prop Tech tools data
const mockPropTech: PropTech[] = [
  {
    id: 1,
    name: "KW PropSage",
    description: "Handle the entire transaction process smoothly from start to finish, paperwork-free.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-propsage.webp`,
    category: "Internal Tool",
    url: "app.propsage.com",
    active: true,
    created_at: "2024-12-01T10:00:00",
    updated_at: "2024-12-01T10:00:00"
  },
  {
    id: 2,
    name: "KW Command",
    description: "Manage your real estate business easily from anywhere with one central hub.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-command.webp`,
    category: "Command Tools",
    url: "agent.kw.com",
    active: true,
    created_at: "2024-11-15T14:30:00",
    updated_at: "2024-11-15T14:30:00"
  },
  {
    id: 101,
    name: "KW Contacts",
    description: "Organize leads and contacts intelligently, never forget important follow-ups again.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-contacts.webp`,
    category: "Command Tools",
    url: "https://console.command.kw.com/command/contacts",
    active: true,
    created_at: "2024-10-20T09:15:00",
    updated_at: "2024-10-20T09:15:00"
  },
  {
    id: 102,
    name: "KW Tasks",
    description: "Track every client's to-do list carefully, ensuring no task gets missed.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tasks.webp`,
    category: "Command Tools",
    url: "https://console.command.kw.com/command/task-manager",
    active: true,
    created_at: "2024-09-30T16:45:00",
    updated_at: "2024-09-30T16:45:00"
  },
  {
    id: 103,
    name: "KW Campaigns",
    description: "Generate steady social media leads without needing complex ad platform expertise.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-campaigns.webp`,
    category: "Command Tools",
    url: "https://campaigns.kw.com/",
    active: true,
    created_at: "2024-08-15T11:20:00",
    updated_at: "2024-08-15T11:20:00"
  },
  {
    id: 104,
    name: "KW Opportunities",
    description: "Track deals from new leads to closings, ensuring payments never missed.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-opportunities.webp`,
    category: "Command Tools",
    url: "https://console.command.kw.com/command/opportunities",
    active: true,
    created_at: "2024-07-10T08:30:00",
    updated_at: "2024-07-10T08:30:00"
  },
  {
    id: 105,
    name: "KW SmartPlans",
    description: "Automate client follow-ups and marketing campaigns, saving time while staying connected.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-smartplans.webp`,
    category: "Command Tools",
    url: "https://console.command.kw.com/command/smart-plans",
    active: true,
    created_at: "2024-06-25T15:45:00",
    updated_at: "2024-06-25T15:45:00"
  },
  {
    id: 106,
    name: "KW Listings",
    description: "Showcase properties beautifully with professional listing pages that attract serious buyers.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-listings.webp`,
    category: "Command Tools",
    url: "https://console.command.kw.com/command/listings",
    active: true,
    created_at: "2024-05-20T12:15:00",
    updated_at: "2024-05-20T12:15:00"
  },
  {
    id: 107,
    name: "KW Website",
    description: "Create branded, user-friendly websites in minutes to capture online inquiries.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-website.webp`,
    category: "Command Tools",
    url: "https://console.command.kw.com/command/websites",
    active: true,
    created_at: "2024-04-15T09:30:00",
    updated_at: "2024-04-15T09:30:00"
  },
  {
    id: 3,
    name: "KW University",
    description: "Access world-class real estate training and mentorship to sharpen skills continuously.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-university.webp`,
    category: "Command Tools",
    url: "https://agent.kw.com/connect/learning/categories",
    active: true,
    created_at: "2024-03-10T14:20:00",
    updated_at: "2024-03-10T14:20:00"
  },
  {
    id: 12,
    name: "Real Insights",
    description: "Get instant, data-driven insights on property value, market trends, and history.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}rea-insights.webp`,
    category: "External Tools",
    url: "https://rea-insight.com/",
    active: true,
    created_at: "2024-02-05T11:45:00",
    updated_at: "2024-02-05T11:45:00"
  },
  {
    id: 13,
    name: "EdgeProp Inspector",
    description: "Access URA planning, school details, and transaction data quickly, all in one place.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}edgeprop-pro.webp`,
    category: "External Tools",
    url: "https://www.edgeprop.sg/analytic/inspector",
    active: true,
    created_at: "2024-01-20T16:30:00",
    updated_at: "2024-01-20T16:30:00"
  },
  {
    id: 108,
    name: "KW Canva",
    description: "Design stunning brochures, posts, and materials easily, no design experience required.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-canva.webp`,
    category: "External Tools",
    url: "canva.kw.com",
    active: true,
    created_at: "2023-12-15T10:15:00",
    updated_at: "2023-12-15T10:15:00"
  },
  {
    id: 118,
    name: "Squarefoot",
    description: "Easily check recent transaction prices of HDBs, condos, and landed properties to ensure your clients get the best deal.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}squarefoot.webp`,
    category: "External Tools",
    url: "squarefoot.com.sg/component/users/login",
    active: true,
    created_at: "2023-11-30T13:25:00",
    updated_at: "2023-11-30T13:25:00"
  },
  {
    id: 120,
    name: "SpiderGate DNC Subscription",
    description: "Verify phone numbers instantly against the Do Not Call registry database.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}spidergate.webp`,
    category: "External Tools",
    url: "https://drive.google.com/file/d/1GcNpqifBzKSurSmz7qkpIMjrjaVOD1Pm/view",
    active: true,
    created_at: "2023-10-25T08:40:00",
    updated_at: "2023-10-25T08:40:00"
  },
  {
    id: 14,
    name: "Sales Proceed",
    description: "Instantly calculate net cash proceeds after property sale and costs.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}sales-proceed.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/sales-proceed",
    active: true,
    created_at: "2023-09-20T15:10:00",
    updated_at: "2023-09-20T15:10:00"
  },
  {
    id: 15,
    name: "Timeline Planning",
    description: "Plan key property transaction milestones with clear, date-based scheduling tool.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}timeline-planning.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/timeline-planning",
    active: true,
    created_at: "2023-08-15T12:35:00",
    updated_at: "2023-08-15T12:35:00"
  },
  {
    id: 16,
    name: "Decoupling",
    description: "Assess cost and benefits of transferring ownership for future property purchase.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}decoupling.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/decoupling",
    active: true,
    created_at: "2023-07-10T09:50:00",
    updated_at: "2023-07-10T09:50:00"
  },
  {
    id: 17,
    name: "Equity Term Loan",
    description: "Estimate how much equity you can unlock through refinancing options.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}equity-term-loan.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/equity-term-loan",
    active: true,
    created_at: "2023-06-05T14:20:00",
    updated_at: "2023-06-05T14:20:00"
  },
  {
    id: 18,
    name: "TDSR/MSR",
    description: "Evaluate buyer affordability using government-mandated loan ratio and income guidelines.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}tdsr-msr.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/tdsr-msr",
    active: true,
    created_at: "2023-05-01T11:15:00",
    updated_at: "2023-05-01T11:15:00"
  },
  {
    id: 19,
    name: "New Project Purchase (BUC)",
    description: "Project progressive payment schedule for building-under-construction properties before completion.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}buc-calculator.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/buc",
    active: true,
    created_at: "2023-03-25T16:45:00",
    updated_at: "2023-03-25T16:45:00"
  },
  {
    id: 20,
    name: "New EC Purchase (BUC)",
    description: "Calculate EC affordability with income ceiling, grant eligibility, and staged payments.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}buc-calculator.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/ec",
    active: true,
    created_at: "2023-02-20T10:30:00",
    updated_at: "2023-02-20T10:30:00"
  },
  {
    id: 21,
    name: "Resale Purchase",
    description: "Estimate upfront costs, loan structure, and timeline for resale property purchase.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}buc-calculator.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/timeline-payment",
    active: true,
    created_at: "2023-01-15T13:20:00",
    updated_at: "2023-01-15T13:20:00"
  },
  {
    id: 22,
    name: "Mortgage Loan",
    description: "Compute monthly repayments and interest impact based on loan tenure and rates.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}mortgage-loan.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/mortgage-loan",
    active: true,
    created_at: "2022-12-10T08:55:00",
    updated_at: "2022-12-10T08:55:00"
  },
  {
    id: 23,
    name: "Pledge/Unpledge",
    description: "Assess affordability impact when pledging or unpledging funds for property loan.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}pledge-unpledge.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/pledge-unpledge",
    active: true,
    created_at: "2022-11-05T15:40:00",
    updated_at: "2022-11-05T15:40:00"
  },
  {
    id: 24,
    name: "ABSD/BSD",
    description: "Calculate Buyer's and Additional Buyer's Stamp Duties for property transactions.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}absd-bsd.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/absd-bsd",
    active: true,
    created_at: "2022-10-01T12:25:00",
    updated_at: "2022-10-01T12:25:00"
  },
  {
    id: 25,
    name: "SSD",
    description: "Determine payable Seller's Stamp Duty based on property holding duration and rules.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}ssd.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/ssd",
    active: true,
    created_at: "2022-08-25T09:15:00",
    updated_at: "2022-08-25T09:15:00"
  },
  {
    id: 26,
    name: "Rental Stamp Duty",
    description: "Instantly compute rental stamp duty payable on signed tenancy agreements.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}rental-stamp-duty.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/calculators/rental-stamp-duty",
    active: true,
    created_at: "2022-07-20T14:50:00",
    updated_at: "2022-07-20T14:50:00"
  },
  {
    id: 27,
    name: "Disparity Effect",
    description: "Analyse property price gaps across different markets through charts to identify undervalued opportunities.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}disparity-effect.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/tech-tools/disparity-effect/charts?type=all",
    active: true,
    created_at: "2022-06-15T11:35:00",
    updated_at: "2022-06-15T11:35:00"
  },
  {
    id: 28,
    name: "Property Comparison",
    description: "Compare multiple properties side-by-side using price, size, and yield metrics.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}buc-calculator.webp`,
    category: "Compass Tools",
    url: "https://proptech.kwsingapore.com/tech-tools/property-comparison",
    active: true,
    created_at: "2022-05-10T16:20:00",
    updated_at: "2022-05-10T16:20:00"
  },
  {
    id: 29,
    name: "Research Chart Mega Vault",
    description: "Compare BUC vs Resale financial outlays, analysing own-stay versus investment.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}research-charts.webp`,
    category: "Research Tools",
    url: "https://drive.google.com/drive/u/2/folders/16cpLVQWIGSmdsat2f9XONQkDbOESYV0m",
    active: true,
    created_at: "2022-04-05T10:45:00",
    updated_at: "2022-04-05T10:45:00"
  },
  {
    id: 30,
    name: "Training Recording: KW PropTech Calculator, EdgeProp Inspector, Real Insights, etc.",
    description: "Learn PropTech calculators, EdgeProp Inspector, and Real Insights through recorded training.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://www.youtube.com/playlist?list=PLLAXUUZdAmAqEH3-QDXlGc4Opm9i3lGa0",
    active: true,
    created_at: "2022-03-01T13:30:00",
    updated_at: "2022-03-01T13:30:00"
  },
  {
    id: 31,
    name: "Training Recording: KW PropSage Deal Submission",
    description: "Watch step-by-step process for submitting and managing deals using PropSage.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://www.youtube.com/playlist?list=PLLAXUUZdAmAoqtN5dPkjshZgUhF735R9x",
    active: true,
    created_at: "2022-01-25T15:15:00",
    updated_at: "2022-01-25T15:15:00"
  },
  {
    id: 32,
    name: "Video Guide: KW Command",
    description: "Get a visual walkthrough of KW Command's main tools and features.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://www.youtube.com/playlist?list=PLLAXUUZdAmAr-TbCVIjwGGCItRE-mQ3Vg",
    active: true,
    created_at: "2021-12-20T09:40:00",
    updated_at: "2021-12-20T09:40:00"
  },
  {
    id: 33,
    name: "Step-by-step Guide: KW Command",
    description: "Follow detailed written steps to navigate KW Command confidently and effectively.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://answers.kw.com/hc/en-us/categories/26283417706515-Command",
    active: true,
    created_at: "2021-11-15T12:25:00",
    updated_at: "2021-11-15T12:25:00"
  },
  {
    id: 34,
    name: "Step-by-step Guide: KW Command Mobile App",
    description: "Master KW Command mobile app functions with clear, easy instructions provided.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://answers.kw.com/hc/en-us/categories/4402619174931-Command-App",
    active: true,
    created_at: "2021-10-10T14:50:00",
    updated_at: "2021-10-10T14:50:00"
  },
  {
    id: 35,
    name: "Step-by-step Guide: Real Insights",
    description: "Leverage Real Insights step-by-step for effective property research and analysis.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://drive.google.com/file/d/1YkRJJebAJhWilzd2mvTMwMGbIvzvBzWY/view?usp=drive_link",
    active: true,
    created_at: "2021-09-05T11:20:00",
    updated_at: "2021-09-05T11:20:00"
  },
  {
    id: 36,
    name: "Step-by-step Guide: Real Insights Valuation Report",
    description: "Generate and interpret valuation reports from Real Insights with simple steps.",
    icon: `${process.env.NEXT_PUBLIC_S3_IMAGE_URL || 'https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/tech-tools/'}kw-tutorial.webp`,
    category: "Training Resource",
    url: "https://drive.google.com/file/d/1KnOVVO_2YtvDta0vS_t0nxCIlo1K0AK3/view?usp=drive_link",
    active: true,
    created_at: "2021-08-01T16:35:00",
    updated_at: "2021-08-01T16:35:00"
  }
];

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function PropTechPage() {
  const router = useRouter();
  const [propTech, setPropTech] = useState<PropTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchPropTech = (page: number = currentPage) => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      // Combine mock prop tech with any prop tech stored in localStorage
      const storedPropTech = JSON.parse(localStorage.getItem('mockPropTech') || '[]');
      const allPropTech = [...mockPropTech, ...storedPropTech];
      
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPropTech = allPropTech.slice(startIndex, endIndex);
      
      setPropTech(paginatedPropTech);
      setPaginationMeta({
        page: page,
        pageSize: itemsPerPage,
        pageCount: Math.ceil(allPropTech.length / itemsPerPage),
        total: allPropTech.length
      });
      setLoading(false);
    }, 500); // Simulate network delay
  };

  useEffect(() => {
    fetchPropTech();
  }, []);

  // Calculate pagination using server-side metadata
  const totalPages = paginationMeta?.pageCount || 1;
  const totalItems = paginationMeta?.total || 0;
  const indexOfFirstItem = ((currentPage - 1) * itemsPerPage) + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const currentPropTech = propTech; // Prop tech are already filtered by server

  const handleEdit = (propTechItem: PropTech) => {
    router.push(`/prop-tech/${propTechItem.id}/edit`);
  };

  const handleDelete = (id: number) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this Prop Tech item?")) {
      // Check if it's a mock prop tech (can't delete) or stored prop tech
      const mockPropTechIndex = mockPropTech.findIndex(item => item.id === id);
      const storedPropTech = JSON.parse(localStorage.getItem('mockPropTech') || '[]');
      const storedPropTechIndex = storedPropTech.findIndex((item: PropTech) => item.id === id);
      
      if (mockPropTechIndex !== -1) {
        toast.error('Cannot delete mock Prop Tech items');
        return;
      }
      
      if (storedPropTechIndex !== -1) {
        storedPropTech.splice(storedPropTechIndex, 1);
        localStorage.setItem('mockPropTech', JSON.stringify(storedPropTech));
        toast.success('Prop Tech item deleted successfully');
        // Refresh the current page
        fetchPropTech(currentPage);
        // If current page becomes empty and it's not the first page, go to previous page
        if (propTech.length === 1 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          fetchPropTech(newPage);
        }
      } else {
        toast.error('Prop Tech item not found');
      }
    }
  };

  const handleAddPropTech = () => {
    router.push("/prop-tech/new");
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchPropTech(pageNumber);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchPropTech(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchPropTech(newPage);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prop Tech</h1>
        <button 
          onClick={handleAddPropTech}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Prop Tech</span>
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          <table className="min-w-full border bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Icon/Logo</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPropTech.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                    No Prop Tech items found.
                  </td>
                </tr>
              ) : (
                currentPropTech.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      {item.icon ? (
                        <img 
                          src={item.icon} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded border border-gray-200" 
                        />
                      ) : (
                        <ImagePlaceholder size="md" />
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2 text-gray-600" title={item.description}>
                      {truncateText(item.description)}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {item.url ? (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Website
                        </a>
                      ) : (
                        <span className="text-gray-400">No URL</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} Prop Tech items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                </button>
                
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 7;
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === i
                              ? "bg-blue-600 text-white border-blue-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // Show pages with ellipsis for large page counts
                    if (currentPage <= 4) {
                      // Show first 5 pages + ellipsis + last page
                      for (let i = 1; i <= 5; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      pages.push(<span key="ellipsis1" className="px-2">...</span>);
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    } else if (currentPage >= totalPages - 3) {
                      // Show first page + ellipsis + last 5 pages
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      pages.push(<span key="ellipsis2" className="px-2">...</span>);
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                    } else {
                      // Show first page + ellipsis + current page and neighbors + ellipsis + last page
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      pages.push(<span key="ellipsis3" className="px-2">...</span>);
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      pages.push(<span key="ellipsis4" className="px-2">...</span>);
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                  }
                  
                  return pages;
                })()}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
