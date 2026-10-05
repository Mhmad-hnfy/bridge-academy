"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useGlobalStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import {
  MessageCircle,
  Users,
  Copy,
  Check,
  Send,
  Filter,
  Phone,
  Search,
} from "lucide-react";

export default function WhatsAppPage() {
  const { users, classes, categories } = useGlobalStore();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [sentMap, setSentMap] = useState({});

  // Pre-fill from URL params (coming from lesson notification prompt)
  useEffect(() => {
    const classId = searchParams.get("classId");
    const msg = searchParams.get("msg");
    if (classId) {
      setFilterType("class");
      setFilterValue(classId);
    }
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
  }, [searchParams]);

  const students = useMemo(() => {
    let list = users.filter((u) => u.role === "student" || !u.role);

    if (filterType === "category" && filterValue) {
      list = list.filter((u) => String(u.categoryId) === String(filterValue));
    } else if (filterType === "class" && filterValue) {
      list = list.filter((u) => String(u.classId) === String(filterValue));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.phone?.includes(q) ||
          u.whatsapp?.includes(q)
      );
    }

    return list;
  }, [users, filterType, filterValue, search]);

  // Normalize phone number to international format
  const normalizePhone = (phone) => {
    if (!phone) return null;
    let p = phone.replace(/\D/g, "");
    if (p.startsWith("0")) p = "20" + p.slice(1); // Egypt prefix
    return p;
  };

  const getWhatsappNumber = (student) => {
    const wa = normalizePhone(student.whatsapp || student.phone);
    return wa;
  };

  const buildWaLink = (phone) => {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encoded}`;
  };

  const sendToStudent = (student) => {
    const phone = getWhatsappNumber(student);
    if (!phone) return;
    setSentMap((prev) => ({ ...prev, [student.id]: true }));
    window.open(buildWaLink(phone), "_blank");
  };

  const copyAllNumbers = () => {
    const numbers = students
      .map((s) => getWhatsappNumber(s))
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(numbers).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const studentsWithPhone = students.filter((s) => getWhatsappNumber(s));
  const studentsWithoutPhone = students.filter((s) => !getWhatsappNumber(s));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          إرسال رسائل واتساب
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          ابعت رسالة جماعية للطلاب المسجلين على المنصة عبر واتساب.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Compose */}
        <div className="space-y-5">
          {/* Message Box */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <label className="block text-sm font-black text-slate-700 mb-3">
              ✍️ نص الرسالة
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا... مثال: عزيزي الطالب، تم نشر درس جديد على المنصة 🎉"
              rows={6}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all outline-none resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-400 font-bold">
                {message.length} حرف
              </span>
              {message.length > 0 && (
                <span className="text-xs text-green-600 font-bold">✓ الرسالة جاهزة</span>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <label className="block text-sm font-black text-slate-700 mb-3">
              <Filter className="w-4 h-4 inline ml-1" />
              فلترة المستلمين
            </label>

            <div className="flex gap-2 mb-4">
              {[
                { value: "all", label: "كل الطلاب" },
                { value: "category", label: "مرحلة دراسية" },
                { value: "class", label: "صف دراسي" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilterType(opt.value);
                    setFilterValue("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === opt.value
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {filterType === "category" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-green-500 outline-none bg-white"
              >
                <option value="">اختر المرحلة...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {filterType === "class" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-green-500 outline-none bg-white"
              >
                <option value="">اختر الصف...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[24px] p-6 border border-green-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-slate-900">{students.length}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">إجمالي</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-600">{studentsWithPhone.length}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">عندهم رقم</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#C4963A]">{studentsWithoutPhone.length}</p>
                <p className="text-xs font-bold text-slate-500 mt-1">بدون رقم</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={copyAllNumbers}
                disabled={studentsWithPhone.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-green-200 text-green-700 font-bold text-sm hover:bg-green-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    نسخ الأرقام
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Students List */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                قائمة المستلمين
              </h2>
              <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">
                {studentsWithPhone.length} طالب
              </span>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو الرقم..."
                className="w-full border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-medium focus:border-green-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[520px]">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Users className="w-10 h-10 mb-3" />
                <p className="font-bold text-sm">لا يوجد طلاب بهذا الفلتر</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {students.map((student) => {
                  const phone = getWhatsappNumber(student);
                  const hasSent = sentMap[student.id];
                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-black text-sm shrink-0">
                        {student.name?.charAt(0) || "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {phone || (
                            <span className="text-[#C4963A]">لا يوجد رقم</span>
                          )}
                        </p>
                      </div>

                      {/* Send Button */}
                      {phone ? (
                        <button
                          onClick={() => sendToStudent(student)}
                          disabled={!message.trim()}
                          title={!message.trim() ? "اكتب الرسالة أولاً" : "فتح واتساب"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            hasSent
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          }`}
                        >
                          {hasSent ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              أُرسل
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-3.5 h-3.5" />
                              إرسال
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#C4963A] font-bold shrink-0">
                          بدون رقم
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/50">
            <p className="text-[11px] text-slate-400 font-medium text-center">
              💡 اضغط على "إرسال" لكل طالب — سيفتح واتساب بالرسالة جاهزة تلقائياً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
