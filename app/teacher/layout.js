"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  FileText,
  FileQuestion,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function TeacherLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTeacher, isLoaded, logoutTeacher, courses = [] } = useGlobalStore();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on login page, don't show the dashboard layout
  const isLoginPage = pathname === "/teacher/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (isLoaded) {
      if (!currentTeacher) {
        router.push("/teacher/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentTeacher, isLoaded, isLoginPage, router]);

  // Close mobile menu on navigate
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0E1726] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#C4963A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const teacher = currentTeacher;
  const linkedCourse = courses.find((c) => c.id === teacher?.courseId);

  // Navigation items based on teacher permissions
  const navItems = [
    { name: "الرئيسية والإحصائيات", icon: LayoutDashboard, href: "/teacher/dashboard", allowed: true },
    {
      name: "الفيديوهات والدروس",
      icon: Video,
      href: "/teacher/videos",
      allowed: teacher?.canAddVideos !== false,
    },
    {
      name: "المذكرات والملفات",
      icon: FileText,
      href: "/teacher/files",
      allowed: teacher?.canAddFiles !== false,
    },
    {
      name: "بنك الامتحانات والكويزات",
      icon: FileQuestion,
      href: "/teacher/quizzes",
      allowed: teacher?.canCreateQuizzes !== false,
    },
    {
      name: "الطلاب المشتركين والنتائج",
      icon: Users,
      href: "/teacher/students",
      allowed: teacher?.canViewStudents !== false,
    },
  ].filter((item) => item.allowed);

  const isActive = (href) => {
    if (href === "/teacher/dashboard") return pathname === "/teacher/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logoutTeacher();
    router.push("/teacher/login");
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
        {/* Brand */}
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
              لوحة تحكم المعلم
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="mr-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teacher Profile Card in Sidebar */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <img
              src={teacher?.image || "https://i.pravatar.cc/100"}
              alt={teacher?.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#C4963A]/40"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-black text-white truncate">{teacher?.name}</h4>
              <p className="text-xs font-bold text-[#C4963A] truncate">{teacher?.subject}</p>
              {linkedCourse && (
                <span className="text-[10px] text-slate-400 truncate block">
                  {linkedCourse.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
            الأقسام والصلاحيات المتاحة
          </p>
          {navItems.map((item) => {
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
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    active ? "text-[#C4963A]" : "text-slate-400 group-hover:text-[#C4963A]"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>عرض المنصة الرئيسية</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:mr-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">
              مرحباً، أستاذ {teacher?.name} 👋
            </span>
            <span className="px-2.5 py-1 bg-[#1B3668]/10 text-[#1B3668] rounded-full text-xs font-black">
              {teacher?.subject}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
