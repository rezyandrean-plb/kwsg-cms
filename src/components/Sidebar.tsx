"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaFolder, FaNewspaper } from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", href: "/", icon: <FaTachometerAlt className="text-xl" /> },
  { name: "Projects", href: "/projects", icon: <FaFolder className="text-xl" /> },
  { name: "Press", href: "/press", icon: <FaNewspaper className="text-xl" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white min-h-screen w-56 border-r flex flex-col py-8 px-4 gap-2 shadow-sm">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Image 
          src="/logo-kwsg-colored.jpeg" 
          alt="KW Singapore" 
          width={120} 
          height={40} 
          className="object-contain"
        />
      </div>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors hover:bg-orange-50 hover:text-orange-600 ${pathname === item.href ? "bg-orange-100 text-orange-600" : "text-gray-700"}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 