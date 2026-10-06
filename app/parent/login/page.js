"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";
import { Phone, ArrowRight, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ParentLogin() {
  const router = useRouter();
  const { loginParent, currentParent } = useGlobalStore();
  const [parentPhone, setParentPhone] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentParent) {
      router.push("/parent/dashboard");
    }
  }, [currentParent, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(parentPhone)) {
      setError("يجب أن يتكون رقم هاتف ولي الأمر من 11 رقماً ويبدأ بـ 01");
      return;
    }
    if (!phoneRegex.test(studentPhone)) {
      setError("يجب أن يتكون رقم هاتف الطالب من 11 رقماً ويبدأ بـ 01");
      return;
    }

    setLoading(true);

    const res = await loginParent(parentPhone, studentPhone);
    if (res.success) {
      router.push("/parent/dashboard");
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1726] flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1B3668]/40 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C4963A]/15 blur-[140px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative mb-4 group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl shadow-[#1B3668]/50 border-2 border-[#C4963A]/40 mx-auto bg-white p-1 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Bridge Academy"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">لوحة ولي الأمر</h1>
          <p className="text-slate-300 text-sm font-medium">تابع مستوى ابنك الأكاديمي في <span className="text-[#C4963A] font-bold">Bridge Academy</span></p>
        </div>

        <div className="bg-[#142038]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white/10 hover:border-[#C4963A]/30 transition-colors relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {error && (
              <div className="p-4 bg-rose-500/10 border-r-4 border-rose-500 text-rose-300 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 pr-1 block">رقم هاتف ولي الأمر</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C4963A] transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  required
                  placeholder="01xxxxxxxxx (11 رقم)"
                  className="w-full bg-white/[0.06] border border-white/15 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 pr-1 block">رقم هاتف الطالب</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C4963A] transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  required
                  placeholder="01xxxxxxxxx (11 رقم)"
                  className="w-full bg-white/[0.06] border border-white/15 rounded-2xl py-4 pr-12 pl-4 text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                />
              </div>
              <p className="text-[11px] text-slate-400 pr-1 font-medium">للتحقق من الحساب، يرجى إدخال رقم هاتف الطالب المسجل.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1B3668] to-[#2D559E] hover:from-[#203F7A] hover:to-[#3561B3] text-white rounded-2xl py-4 font-bold shadow-xl shadow-[#1B3668]/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 border border-white/10"
            >
              <span>{loading ? "جاري التحقق..." : "دخول للوحة المتابعة"}</span>
              {!loading && <ArrowRight className="w-5 h-5 scale-x-[-1] text-[#C4963A]" />}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-4">
          <Link href="/login" className="text-slate-400 hover:text-[#C4963A] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            دخول كطالب بدلاً من ذلك
          </Link>
        </div>
      </div>
    </div>
  );
}
