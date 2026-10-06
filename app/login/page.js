"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Phone, Lock, Eye, EyeOff, LogIn, UserPlus, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";

const LoginPage = () => {
  const router = useRouter();
  const { loginUser, currentUser } = useGlobalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [currentUser, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 11) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("يجب أن يتكون رقم الهاتف من 11 رقماً ويبدأ بـ 01");
      return;
    }

    const result = await loginUser(formData.phone, formData.password);
    if (result.success) {
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      setError(result.message);
    }
  };

  const inputContainerClass = "relative mb-5 group";
  const iconClass =
    "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C4963A] transition-colors";
  const inputClass =
    "w-full py-4 pr-12 pl-4 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all text-right";
  const labelClass = "block text-slate-200 text-sm font-semibold mb-2 mr-1";

  return (
    <div className="min-h-screen bg-[#0E1726] flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Decorative Gradients & Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#1B3668]/40 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-[#C4963A]/15 blur-[140px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#122040]/50 blur-[160px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#142038]/80 backdrop-blur-2xl border border-white/10 hover:border-[#C4963A]/30 transition-colors rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black/50 relative">
          {/* Top Logo & Title */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block relative mb-5 group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl shadow-[#1B3668]/50 border-2 border-[#C4963A]/40 mx-auto bg-white p-1 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo2.jpeg"
                  alt="Bridge Academy"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-slate-300 text-sm font-medium">
              أهلاً بك مجدداً في <span className="text-[#C4963A] font-bold">Bridge Academy</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="text-center font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl py-3 px-4 text-xs mb-5 animate-in fade-in">
                {error}
              </div>
            )}

            <div className={inputContainerClass}>
              <label className={labelClass}>رقم هاتف الطالب</label>
              <div className="relative">
                <Phone className={iconClass} size={20} />
                <input
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01xxxxxxxxx (11 رقم)"
                  maxLength={11}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className={inputContainerClass}>
              <label className={labelClass}>كلمة المرور</label>
              <div className="relative">
                <Lock className={iconClass} size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#C4963A] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-start mb-6 mr-1">
              <Link
                href="#"
                className="text-xs text-slate-400 hover:text-[#C4963A] transition-colors font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#1B3668] to-[#2D559E] hover:from-[#203F7A] hover:to-[#3561B3] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#1B3668]/40 border border-white/10 transition-all flex items-center justify-center gap-3"
            >
              <span>دخول</span>
              <LogIn size={20} className="text-[#C4963A]" />
            </motion.button>

            <div className="text-center mt-8 p-5 bg-white/[0.04] rounded-2xl border border-white/5 space-y-3">
              <span className="text-slate-400 text-xs block">ليس لديك حساب بعد؟</span>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 text-white font-bold hover:text-[#C4963A] transition-all text-base group"
              >
                <UserPlus
                  size={18}
                  className="text-[#C4963A] group-hover:scale-110 transition-transform"
                />
                <span>إنشاء حساب طالب جديد</span>
              </Link>
              <div className="h-px bg-white/10 my-3"></div>
              <Link
                href="/parent/login"
                className="flex items-center justify-center gap-2 text-slate-300 font-semibold hover:text-[#C4963A] transition-all text-xs group"
              >
                <Users size={15} className="text-[#C4963A]" />
                <span>دخول ولي الأمر لمتابعة مستوى الطالب</span>
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
