"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Key,
  Video,
  Layers,
  ChevronLeft,
  BookMarked,
  Home,
  MessageCircle,
} from "lucide-react";

const menuGroups = [
  {
    label: "عام",
    items: [
      { name: "الرئيسية", icon: LayoutDashboard, href: "/admin" },
    ],
  },
  {
    label: "المحتوى التعليمي",
    items: [
      { name: "الكورسات / المراحل", icon: Layers, href: "/admin/categories" },
      { name: "المواد الدراسية", icon: BookOpen, href: "/admin/courses" },
      { name: "الأبواب والفصول", icon: ChevronLeft, href: "/admin/chapters" },
      { name: "الدروس", icon: Video, href: "/admin/lessons" },
    ],
  },
  {
    label: "المستخدمون",
    items: [
      { name: "الطلاب", icon: Users, href: "/admin/users" },
      { name: "المدرسين", icon: GraduationCap, href: "/admin/teachers" },
      { name: "الأكواد", icon: Key, href: "/admin/codes" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { name: "الإشعارات", icon: Bell, href: "/admin/notifications" },
      { name: "الإعدادات", icon: Settings, href: "/admin/settings" },
    ],
  },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoaded, logoutUser } = useGlobalStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentUser, isLoaded, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0E1726] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#C4963A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex" dir="rtl">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0E1726]/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-[#0F1A30] text-white h-screen fixed right-0 top-0 border-l border-white/10 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-white/10 bg-[#0B1324] shrink-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white p-0.5 border border-[#C4963A]/40 shadow-md shadow-black/40 shrink-0">
            <Image
              src="/logo2.jpeg"
              alt="Bridge Academy"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white leading-tight">
              Bridge Academy
            </span>
            <span className="text-[11px] font-bold text-[#C4963A]">
              لوحة الإدارة
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="mr-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all group ${
                        active
                          ? "bg-gradient-to-r from-[#1B3668] to-[#24427D] text-white shadow-md shadow-[#1B3668]/40 border-r-2 border-[#C4963A]"
                          : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? "text-[#C4963A]" : "text-slate-400 group-hover:text-[#C4963A]"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1 shrink-0 bg-[#0B1324]/50">
          <Link
            href="/"
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all font-bold text-sm"
          >
            <Home className="w-4 h-4 text-[#C4963A]" />
            <span>العودة للموقع</span>
          </Link>
          <button
            onClick={async () => {
              await logoutUser();
              router.push("/login");
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-[#C4963A] hover:bg-white/5 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4 text-[#C4963A]" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:mr-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#EAE3D6] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-slate-600 hover:text-[#1B3668] transition-colors p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Current page breadcrumb */}
            <span className="text-sm font-bold text-[#1B3668] hidden sm:block">
              {menuGroups
                .flatMap((g) => g.items)
                .find((i) => isActive(i.href))?.name ?? "لوحة الإدارة"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin/notifications" className="relative text-slate-500 hover:text-[#1B3668] transition-colors p-1.5 rounded-xl hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C4963A] rounded-full border-2 border-white"></span>
            </Link>
            <div className="flex items-center gap-2.5 pl-4 border-r border-[#EAE3D6]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#122040]">{currentUser?.name || "المدير العام"}</p>
                <p className="text-[10px] text-slate-500 font-medium">{currentUser?.email || "admin@bridgeacademy.edu"}</p>
              </div>
              <img
                src={currentUser?.image || "https://i.pravatar.cc/150?u=admin"}
                alt="Admin"
                className="w-9 h-9 rounded-xl border-2 border-[#C4963A]/40 object-cover shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 flex-1 overflow-x-auto">{children}</div>
      </main>
    </div>
  );
}
