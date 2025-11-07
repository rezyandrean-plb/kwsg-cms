"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaFolder, FaNewspaper, FaCalendarAlt, FaBuilding, FaRocket } from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", href: "/", icon: <FaTachometerAlt className="text-xl" /> },
  { name: "Projects", href: "/projects", icon: <FaFolder className="text-xl" /> },
  { name: "New Launch Collection", href: "/new-launch-collection", icon: <FaRocket className="text-xl" /> },
  { name: "Events", href: "/events", icon: <FaCalendarAlt className="text-xl" /> },
  { name: "Prop Tech", href: "/prop-tech", icon: <FaBuilding className="text-xl" /> },
  { name: "Press", href: "/press", icon: <FaNewspaper className="text-xl" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-64 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-r flex flex-col py-6 px-4 gap-3 shadow-sm">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Image 
          src="/logo-kwsg-colored.jpeg" 
          alt="KW Singapore" 
          width={122} 
          height={42} 
          className="object-contain select-none"
        />
      </div>
      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all
              ${pathname === item.href
                ? "text-blue-700 bg-gradient-to-r from-blue-50 to-emerald-50 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)]"
                : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"}
            `}
          >
            <span className={`shrink-0 ${pathname === item.href ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`}>{item.icon}</span>
            <span className="truncate">{item.name}</span>
            {pathname === item.href && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r-full bg-blue-500" />
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 