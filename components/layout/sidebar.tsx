'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building, LogOut, ChevronRight, Settings, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setLogout } from '@/lib/authSlice';
import { showToast } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Image from 'next/image';

const navigation = [
  { name: 'sidebar.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'sidebar.companies', href: '/dashboard/companies', icon: Building },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const t = useTranslations();

  // Generate initials from username or email
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Generate logo from user's first and last name
  const getLogoFromName = (name: string) => {
    if (!name) return 'SCM';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    // Clear rememberMe cookie
    document.cookie = 'rememberMe=false; path=/; max-age=0';
    dispatch(setLogout());
    showToast({ title: t('auth.logout.logoutSuccessful') });
    // Force reload and redirect to login to re-initialize Redux Persist with correct storage
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-light flex flex-col py-6 shadow-2xl border-r border-slate-700/50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between px-6 mb-6 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {user?.profile ? (
                <Image
                  src={user.profile}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
                    {getLogoFromName(user?.name || '')}
                  </span>
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">
                {user?.userType || ''}
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Logo Section */}
        <div className="hidden lg:flex items-center justify-between px-6 mb-10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {user?.profile ? (
                <Image
                  src={user.profile}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover shadow-lg border-2 border-white"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
                    {getLogoFromName(user?.name || '')}
                  </span>
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">
                {user?.userType || ''}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced User Profile - Moved to top */}
        <div className="px-4 mb-6">
          <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 hover:from-slate-700/50 hover:to-slate-600/30 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-slate-600/50">
            {/* <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getInitials(user?.name || '')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800"></div>
            </div> */}
            <div className="flex-1 ml-3">
              <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 hover:text-white transition-colors duration-300" />
          </div>
        </div>

        {/* Language Switcher */}
        <div className="px-4 mb-4">
          <LanguageSwitcher />
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex flex-col flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={cn(
                  "group flex items-center justify-between px-4 py-4 text-md transition-all duration-300 rounded-xl",
                  "hover:bg-slate-700/60 hover:shadow-lg hover:scale-[1.02]",
                  "border border-transparent hover:border-slate-600/50",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-lg border-slate-600/50" 
                    : "text-slate-300",
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "p-2.5 mr-3 rounded-lg transition-all duration-300",
                    isActive 
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md" 
                      : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{t(item.name)}</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all duration-300",
                  isActive ? "text-blue-300 rotate-90" : "text-slate-500 group-hover:text-slate-300"
                )} />
              </Link>
            );
          })}
          
          {/* Enhanced Logout */}
          <div className="mt-auto pt-6 border-t border-slate-700/50">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-4 text-md text-slate-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-rose-600/20 hover:to-red-600/20 border border-transparent hover:border-rose-600/30"
            >
              <div className="p-2.5 mr-3 rounded-lg bg-slate-700/50 text-slate-400 group-hover:bg-rose-600/20 group-hover:text-rose-400 transition-all duration-300">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">{t('sidebar.logout')}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ChevronRight className="w-4 h-4 text-rose-300" />
              </div>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};