"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  School,
  Play,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";

const RegistrationPage = () => {
  const router = useRouter();
  const { registerUser, classes, categories, currentUser } = useGlobalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [currentUser, router]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
    categoryId: "",
    classId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "whatsapp") {
      // أرقام فقط والحد الأقصى 11 رقماً
      const numericOnly = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, [name]: numericOnly }));
      if (error) setError("");
      return;
    }
    if (name === "nationalId") {
      // أرقام فقط والحد الأقصى 14 رقماً
      const numericOnly = value.replace(/\D/g, "").slice(0, 14);
      setFormData((prev) => ({ ...prev, [name]: numericOnly }));
      if (error) setError("");
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // التحقق من رقم الهاتف: 11 رقماً ويبدأ بـ 01
    const phoneRegex = /^01[0-9]{9}$/;
    if (!formData.phone) {
      setError("رقم الهاتف مطلوب");
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      setError("يجب أن يتكون رقم الهاتف من 11 رقماً ويبدأ بـ 01 (أرقام فقط)");
      return;
    }

    // التحقق من رقم الواتساب: 11 رقماً ويبدأ بـ 01
    if (!formData.whatsapp) {
      setError("رقم الواتساب مطلوب");
      return;
    }
    if (!phoneRegex.test(formData.whatsapp)) {
      setError("يجب أن يتكون رقم الواتساب من 11 رقماً ويبدأ بـ 01 (أرقام فقط)");
      return;
    }

    // التحقق من الرقم القومي: 14 رقماً وأرقام فقط
    const nationalIdRegex = /^[0-9]{14}$/;
    if (!formData.nationalId) {
      setError("الرقم القومي مطلوب");
      return;
    }
    if (!nationalIdRegex.test(formData.nationalId)) {
      setError("يجب أن يتكون الرقم القومي من 14 رقماً (أرقام فقط)");
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    
    setLoading(true);
    const result = await registerUser({
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        classId: formData.classId ? parseInt(formData.classId) : null
    });
    setLoading(false);

    if (result.success) {
        setRegisteredName(formData.name);
        setShowSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        setError(result.message);
    }
  };

  const inputContainerClass = "relative mb-5 group";
  const iconClass = "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C4963A] transition-colors";
  const inputClass = "w-full py-4 pr-12 pl-4 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all text-right";
  const labelClass = "block text-slate-200 text-sm font-semibold mb-2 mr-1";

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#0E1726] flex flex-col items-center justify-center p-4 py-20 relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1B3668]/40 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#C4963A]/20 blur-[130px] rounded-full"></div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
          <div className="bg-[#142038]/85 backdrop-blur-2xl border border-[#C4963A]/30 rounded-[3rem] p-8 md:p-12 shadow-2xl text-center">
            <div className="w-24 h-24 bg-[#C4963A]/15 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#C4963A]/40 shadow-lg shadow-[#C4963A]/20">
                <CheckCircle2 className="text-[#C4963A] w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-white mb-4">أهلاً بك يا {registeredName.split(" ")[0]}!</h1>
            <p className="text-slate-300 text-lg mb-10 font-medium">تم إنشاء حسابك بنجاح في <span className="text-[#C4963A] font-bold">Bridge Academy</span>. يمكنك الآن الدخول لمتابعة محاضراتك وموادك.</p>
            <div className="space-y-4">
              <Link href="/login" className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-[#1B3668] to-[#2D559E] hover:from-[#203F7A] hover:to-[#3561B3] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#1B3668]/40 transition-all border border-white/10">
                <Play className="w-5 h-5 fill-current text-[#C4963A]" />
                سجل دخولك الآن
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1726] flex flex-col items-center justify-center p-4 py-16 relative overflow-hidden" dir="rtl">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1B3668]/40 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#C4963A]/15 blur-[140px] rounded-full"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="bg-[#142038]/80 backdrop-blur-2xl border border-white/10 hover:border-[#C4963A]/30 transition-colors rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/50">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block relative mb-4 group">
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
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">إنشاء حساب طالب جديد</h1>
            <p className="text-slate-300 text-sm font-medium">انضم لأكاديمية <span className="text-[#C4963A] font-bold">Bridge Academy</span> وابدأ رحلة التفوق في معادلة الهندسة</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 mb-6 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm font-bold rounded-2xl text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-6">
              <div className={inputContainerClass}>
                <label className={labelClass}>الاسم الكامل</label>
                <div className="relative">
                  <User className={iconClass} size={20} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسمك ثلاثي أو رباعي" required className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className={inputContainerClass}>
                    <div className="flex justify-between items-center mb-2 mr-1">
                      <label className="text-slate-200 text-sm font-semibold">رقم الهاتف (للدخول)</label>
                      <span className={`text-xs font-mono font-bold ${formData.phone.length === 11 && formData.phone.startsWith("01") ? "text-emerald-400" : "text-slate-400"}`}>
                        {formData.phone.length}/11 رقم
                      </span>
                    </div>
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
                        className={`${inputClass} ${formData.phone && (!formData.phone.startsWith("01") || (formData.phone.length === 11 && !/^01\d{9}$/.test(formData.phone))) ? "border-rose-500/60 focus:border-rose-500" : ""}`} 
                      />
                    </div>
                    {formData.phone && !formData.phone.startsWith("01") && (
                      <p className="text-rose-400 text-xs mt-1.5 mr-1 font-semibold">يجب أن يبدأ رقم الهاتف بـ 01</p>
                    )}
                </div>

                <div className={inputContainerClass}>
                    <div className="flex justify-between items-center mb-2 mr-1">
                      <label className="text-slate-200 text-sm font-semibold">رقم الواتساب</label>
                      <span className={`text-xs font-mono font-bold ${formData.whatsapp.length === 11 && formData.whatsapp.startsWith("01") ? "text-emerald-400" : "text-slate-400"}`}>
                        {formData.whatsapp.length}/11 رقم
                      </span>
                    </div>
                    <div className="relative">
                      <PlusCircle className={iconClass} size={20} />
                      <input 
                        type="tel" 
                        inputMode="numeric"
                        name="whatsapp" 
                        value={formData.whatsapp} 
                        onChange={handleChange} 
                        placeholder="01xxxxxxxxx (11 رقم)" 
                        maxLength={11}
                        required 
                        className={`${inputClass} ${formData.whatsapp && (!formData.whatsapp.startsWith("01") || (formData.whatsapp.length === 11 && !/^01\d{9}$/.test(formData.whatsapp))) ? "border-rose-500/60 focus:border-rose-500" : ""}`} 
                      />
                    </div>
                    {formData.whatsapp && !formData.whatsapp.startsWith("01") && (
                      <p className="text-rose-400 text-xs mt-1.5 mr-1 font-semibold">يجب أن يبدأ رقم الواتساب بـ 01</p>
                    )}
                </div>
              </div>

              <div className={inputContainerClass}>
                <div className="flex justify-between items-center mb-2 mr-1">
                  <label className="text-slate-200 text-sm font-semibold">الرقم القومي (أرقام فقط)</label>
                  <span className={`text-xs font-mono font-bold ${formData.nationalId.length === 14 ? "text-emerald-400" : "text-slate-400"}`}>
                    {formData.nationalId.length}/14 رقم
                  </span>
                </div>
                <div className="relative">
                  <CreditCard className={iconClass} size={20} />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    name="nationalId" 
                    value={formData.nationalId} 
                    onChange={handleChange} 
                    placeholder="الرقم القومي المكون من 14 رقماً" 
                    maxLength={14} 
                    required 
                    className={`${inputClass} ${formData.nationalId && formData.nationalId.length === 14 && !/^\d{14}$/.test(formData.nationalId) ? "border-rose-500/60 focus:border-rose-500" : ""}`} 
                  />
                </div>
                {formData.nationalId && formData.nationalId.length > 0 && formData.nationalId.length < 14 && (
                  <p className="text-slate-400 text-xs mt-1.5 mr-1 font-medium">متبقي {14 - formData.nationalId.length} أرقام لاكتمال الرقم القومي</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className={inputContainerClass}>
                    <label className={labelClass}>كلمة المرور</label>
                    <div className="relative">
                    <Lock className={iconClass} size={20} />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className={inputClass} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#C4963A] transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
                <div className={inputContainerClass}>
                    <label className={labelClass}>تأكيد كلمة المرور</label>
                    <div className="relative">
                    <Lock className={iconClass} size={20} />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className={inputClass} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#C4963A] transition-colors">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-[#1B3668] to-[#2D559E] hover:from-[#203F7A] hover:to-[#3561B3] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#1B3668]/40 border border-white/10 transition-all disabled:opacity-50"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب الآن"}
            </motion.button>

            <div className="text-center mt-6 text-slate-400 text-sm">
              <span>لديك حساب بالفعل؟ </span>
              <Link href="/login" className="text-[#C4963A] hover:text-[#e0b04a] font-bold transition-colors">تسجيل الدخول</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;
