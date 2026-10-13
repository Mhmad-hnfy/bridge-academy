"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Phone, ArrowLeft, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function TeacherLoginPage() {
  const router = useRouter();
  const { loginTeacher } = useGlobalStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await loginTeacher(identifier, password);
      if (res.success) {
        router.push("/teacher/dashboard");
      } else {
        setError(res.message || "بيانات الدخول غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1726] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#C4963A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#1B3668]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#131F37] border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white p-1 border-2 border-[#C4963A] shadow-lg shadow-black/40">
            <Image
              src="/logo2.jpeg"
              alt="Bridge Academy"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4963A]/15 border border-[#C4963A]/30 text-[#C4963A] text-xs font-black mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            بوابة المعلمين
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">تسجيل دخول المدرس</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            أهلاً بك في لوحة تحكم المعلم الخاصة بـ Bridge Academy
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              رقم الهاتف أو اسم المستخدم
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="010XXXXXXXX"
                dir="ltr"
                className="w-full bg-[#0E1726] border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-white text-sm focus:outline-none focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-[#0E1726] border border-white/10 rounded-xl py-3.5 pr-12 pl-12 text-white text-sm focus:outline-none focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C4963A] to-[#D4A84A] text-slate-900 font-black text-sm shadow-lg shadow-[#C4963A]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>دخول لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors font-bold"
          >
            ← العودة للصفحة الرئيسية للمنصة
          </Link>
        </div>
      </div>
    </div>
  );
}
