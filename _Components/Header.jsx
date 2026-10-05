"use client";

import React, { useState, useEffect } from "react";
import { X, Menu, User, LogOut, LayoutDashboard, Bell, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useGlobalStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Brand colors — exact match to Bridge Academy logo
const C = {
  navy:     "#1B3668",
  navyDark: "#122040",
  navyMid:  "#2D559E",
  gold:     "#C4963A",
  goldLight:"#D4A84A",
  offWhite: "#F8F5F0",
  offWhite2:"#F0EBE3",
  border:   "#E5DDD2",
  muted:    "#6B7A95",
};

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logoutUser, notifications, dismissedNotifications, dismissNotification } = useGlobalStore();
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const studentNotifications = notifications.filter(notif => {
    if (!currentUser || currentUser.role === "admin") return false;
    const isDismissed = dismissedNotifications.some(
      d => d.notificationId === notif.id && d.userId === currentUser.id
    );
    if (isDismissed) return false;
    if (notif.targetType === "all") return true;
    if (notif.targetType === "category" && notif.categoryId === currentUser.categoryId) return true;
    if (notif.targetType === "class"    && notif.classId    === currentUser.classId)    return true;
    return false;
  });

  const handleLogout = () => {
    logoutUser();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { name: "الرئيسية",           href: "/" },
    { name: "المسارات التعليمية", href: "/courses" },
    { name: "المدرسين",           href: "/Team" },
    { name: "من نحن",             href: "#about" },
    { name: "تواصل معنا",         href: "#contact" },
  ];

  return (
    <header
      className="sticky top-0 z-[1000] w-full font-bold transition-all duration-500"
      style={{
        background: scrolled ? "rgba(248,245,240,0.96)" : C.offWhite,
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${C.border}`,
        boxShadow: scrolled ? "0 2px 20px rgba(27,54,104,0.10)" : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="relative w-14 h-14 overflow-hidden rounded-xl transition-all duration-300"
            style={{
              border: `2px solid ${C.border}`,
              boxShadow: "0 2px 8px rgba(27,54,104,0.08)",
            }}
          >
            <Image
              src="/logo2.jpeg"
              alt="Bridge Academy Logo"
              fill
              className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-500"
              style={{ background: C.offWhite2 }}
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-xl font-black tracking-tight"
              style={{
                background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bridge Academy
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: C.gold }}>
              معادلة كلية الهندسة
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-semibold relative group py-1 transition-colors duration-300"
              style={{ color: link.href === "/" ? C.navy : C.muted }}
            >
              {link.name}
              <span
                className="absolute -bottom-0.5 right-0 h-0.5 rounded-full transition-all duration-300"
                style={{
                  background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
                  width: link.href === "/" ? "100%" : "0",
                }}
                /* hover handled by group — inline style can't do group-hover, use onMouse */
              />
            </Link>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3">

          {/* Bell */}
          {currentUser && currentUser.role !== "admin" && (
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-xl transition-all border border-transparent hover:border-[#E5DDD2]"
                style={{ color: C.navy, background: "transparent" }}
                title="الإشعارات"
              >
                <Bell size={22} />
                {studentNotifications.length > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                    style={{ background: C.gold }}
                  >
                    {studentNotifications.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  className="absolute left-0 mt-3 w-80 rounded-3xl z-[1100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  dir="rtl"
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 20px 60px rgba(27,54,104,0.15)",
                  }}
                >
                  <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: C.border, background: C.offWhite }}>
                    <h3 className="font-black flex items-center gap-2" style={{ color: C.navy }}>
                      <Bell size={17} style={{ color: C.gold }} />
                      التنبيهات الجديدة
                    </h3>
                    <button onClick={() => setIsNotificationsOpen(false)} style={{ color: C.muted }}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {studentNotifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <Bell size={40} className="mx-auto mb-3 opacity-20" style={{ color: C.navy }} />
                        <p className="text-sm font-bold" style={{ color: C.muted }}>لا توجد تنبيهات حالياً</p>
                      </div>
                    ) : (
                      studentNotifications.map(notif => (
                        <div
                          key={notif.id}
                          className="p-4 border-b group transition-colors"
                          style={{ borderColor: C.border }}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-black text-sm mb-1" style={{ color: C.navy }}>{notif.title}</h4>
                              <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: C.muted }}>{notif.message}</p>
                              <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: C.gold }}>
                                <Clock size={10} />
                                {new Date(notif.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); dismissNotification(currentUser.id, notif.id); }}
                              className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {studentNotifications.length > 0 && (
                    <Link
                      href="/profile"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block w-full py-3 text-center text-xs font-bold transition-colors"
                      style={{ color: C.gold, background: C.offWhite }}
                    >
                      عرض كل الإشعارات في حسابي
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Auth */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-3">
              {currentUser.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all"
                  style={{ background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})` }}
                >
                  <LayoutDashboard size={17} />
                  لوحة التحكّم
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border hover:opacity-90 transition-all"
                style={{ background: C.offWhite2, color: C.navy, borderColor: C.border }}
              >
                <User size={17} />
                حسابي
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl transition-all hover:bg-red-50"
                style={{ color: C.muted }}
                title="تسجيل الخروج"
              >
                <LogOut size={21} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                style={{ color: C.navy, borderColor: C.border, background: "transparent" }}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` }}
              >
                حساب جديد
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg lg:hidden transition-colors"
            style={{ color: C.navy }}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[1100] transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: "rgba(10,22,40,0.78)" }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] shadow-2xl transition-transform duration-300 transform border-l ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ background: C.offWhite, borderColor: C.border }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                  <Image src="/logo2.jpeg" alt="Bridge Academy" fill className="object-contain p-0.5" style={{ background: C.offWhite2 }} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-black" style={{ color: C.navy }}>Bridge Academy</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: C.gold }}>Faculty of Engineering</span>
                </div>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg" style={{ color: C.muted }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1.5 flex-1">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3.5 rounded-xl text-base font-semibold transition-all"
                  style={{
                    background: link.href === "/" ? `${C.navy}15` : "transparent",
                    color: link.href === "/" ? C.navy : C.muted,
                  }}
                >
                  {link.name}
                </Link>
              ))}
              {currentUser?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2"
                  style={{ color: C.navy }}
                >
                  <LayoutDashboard size={19} style={{ color: C.gold }} />
                  لوحة التحكّم
                </Link>
              )}
            </nav>

            {/* Auth Footer */}
            <div className="pt-5 border-t flex flex-col gap-3" style={{ borderColor: C.border }}>
              {currentUser ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${C.navyDark}, ${C.navy})` }}
                  >
                    <User size={19} />
                    حسابي الشخصي
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl font-semibold"
                    style={{ background: C.offWhite2, color: C.muted }}
                  >
                    <LogOut size={19} />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center rounded-xl border font-bold"
                    style={{ color: C.navy, borderColor: C.border }}
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 text-center text-white rounded-xl font-bold shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` }}
                  >
                    إنشاء حساب جديد
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
