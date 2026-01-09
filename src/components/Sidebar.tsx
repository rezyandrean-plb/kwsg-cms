"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaNewspaper, FaCalendarAlt, FaBuilding, FaRocket, FaEnvelope } from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", href: "/", icon: FaTachometerAlt },
  { name: "New Launch Collection", href: "/new-launch-collection", icon: FaRocket },
  { name: "Newsletters", href: "/newsletters", icon: FaEnvelope },
  { name: "Events", href: "/events", icon: FaCalendarAlt },
  { name: "Prop Tech", href: "/prop-tech", icon: FaBuilding },
  { name: "Press", href: "/press", icon: FaNewspaper },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200/80 bg-white/95 backdrop-blur-xl transition-all duration-300">
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-gray-200/50 px-6">
          <Image 
            src="/logo-kwsg-colored.jpeg" 
            alt="KW Singapore" 
            width={122} 
            height={42} 
            className="object-contain select-none transition-opacity hover:opacity-90"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                )}
                
                {/* Icon */}
                <Icon 
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive 
                      ? "text-blue-600" 
                      : "text-gray-500 group-hover:text-gray-700"
                  }`} 
                />
                
                {/* Label */}
                <span className="truncate">{item.name}</span>
                
                {/* Hover effect */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50/0 to-indigo-50/0 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200/50 p-4">
          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 p-3">
            <p className="text-xs font-medium text-gray-600">CMS Version</p>
            <p className="text-xs text-gray-500 mt-0.5">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
