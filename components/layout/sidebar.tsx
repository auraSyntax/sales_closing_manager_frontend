'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage Companies', href: '/dashboard/companies', icon: Building },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-primary-dark text-light flex flex-col py-8 shadow-xl">
      {/* Logo */}
      <div className="flex items-center justify-center mb-14">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          K
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-4 text-lg transition-all duration-200",
                "hover:bg-primary-light hover:text-white",
                isActive ? "bg-primary-light text-white" : "text-gray-300"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        <Link
          href="/login"
          className="flex items-center px-6 py-4 text-lg text-gray-300 hover:bg-primary-light hover:text-white transition-all duration-200 mt-auto"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Link>
      </nav>
    </div>
  );
};