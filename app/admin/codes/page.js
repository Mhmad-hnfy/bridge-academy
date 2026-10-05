"use client";

import React, { useState } from "react";
import { useGlobalStore } from "@/lib/store";
import {
  Key,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";

export default function CodesManagement() {
  const {
    categories,
    classes,
    courses,
    chapters,
    codes,
    generateCodes,
    deleteCode,
    deleteCodes,
  } = useGlobalStore();

  const [selectedCodes, setSelectedCodes] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [formData, setFormData] = useState({
    categoryId: "",
    classId: "",
    courseId: "",
    chapterId: "",
    maxUses: 1,
  });

  const filteredClasses = classes.filter(
    (c) => c.categoryId === parseInt(formData.categoryId),
  );

  const filteredCourses = courses.filter(
    (c) => c.classId === parseInt(formData.classId),
  );

  const filteredChapters = chapters.filter(
    (ch) => ch.courseId === parseInt(formData.courseId),
  );

  const handleGenerate = (e) => {
    e.preventDefault();
    generateCodes(generateCount, {
      categoryId: parseInt(formData.categoryId),
      classId: parseInt(formData.classId),
      chapterId: parseInt(formData.chapterId),
      maxUses: parseInt(formData.maxUses),
    });
    setIsModalOpen(false);
  };

  const sortedCodes = [...codes].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
    const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });

  const toggleSelectAll = () => {
    if (selectedCodes.size === sortedCodes.length && sortedCodes.length > 0) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(sortedCodes.map((c) => c.id)));
    }
  };

  const toggleSelectCode = (id) => {
    const newSelected = new Set(selectedCodes);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedCodes(newSelected);
  };

  const handleBulkDelete = () => {
    if (confirm(`هل أنت متأكد من حذف ${selectedCodes.size} كود؟`)) {
      deleteCodes(Array.from(selectedCodes));
      setSelectedCodes(new Set());
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("تم نسخ الكود: " + text);
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800">إدارة الأكواد</h1>
          <p className="text-slate-500 font-medium">
            توليد ومتابعة أكواد تفعيل الأبواب للمواد الدراسية
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#C4963A] text-white rounded-2xl font-bold hover:bg-[#b8872e] transition-all shadow-lg shadow-[#E8C87A]"
        >
          <Plus className="w-5 h-5" />
          توليد أكواد جديدة
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">الأكواد المصدرة</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-500">
              الإجمالي: {codes.length} كود
            </span>
            {selectedCodes.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-[#C4963A] text-white rounded-xl text-sm font-bold hover:bg-[#b8872e] transition-all shadow-md shadow-[#E8C87A]"
              >
                <Trash2 className="w-4 h-4" />
                حذف المحدد ({selectedCodes.size})
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    {selectedCodes.size === sortedCodes.length &&
                    sortedCodes.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-[#C4963A]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-600">
                  الكود
                </th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-600">
                  الباب
                </th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-600">
                  الاستخدام
                </th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-600">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-600">
                  الحالة
                </th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-600">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedCodes.map((code) => {
                const chapter = chapters.find((ch) => ch.id === code.chapterId);
                return (
                  <tr
                    key={code.id}
                    className={`hover:bg-slate-50/50 transition-colors ${selectedCodes.has(code.id) ? "bg-[#FDF8F0]/30" : ""}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleSelectCode(code.id)}
                        className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        {selectedCodes.has(code.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#C4963A]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-200" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-800 font-bold select-all">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {chapter?.name || "باب غير معروف"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C4963A] rounded-full"
                            style={{
                              width: `${(code.usedCount / code.maxUses) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {code.usedCount}/{code.maxUses}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {code.createdAt || code.created_at
                        ? new Date(
                            code.createdAt || code.created_at,
                          ).toLocaleDateString("ar-EG")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {code.usedCount < code.maxUses ? (
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                          نشط
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                          مكتمل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="نسخ الكود"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا الكود؟")) {
                              deleteCode(code.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-[#C4963A] transition-colors"
                          title="حذف الكود"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {codes.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-slate-400 font-bold"
                  >
                    لا يوجد أكواد حالياً. قم بتوليد أكواد جديدة للبدء.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Codes Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#C4963A] to-[#d4a84a] p-8 text-white relative">
              <h3 className="text-2xl font-black">توليد أكواد جديدة</h3>
              <p className="text-[#FDF8F0] text-sm mt-1">
                قم باختيار تفاصيل الدفعة وعدد الأكواد المطلوبة
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                dir="ltr"
              >
                <Trash2 className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 block pr-2">
                    المرحلة
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-sm"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        categoryId: e.target.value, 
                        classId: "", 
                        courseId: "", 
                        chapterId: "" 
                      })
                    }
                    required
                  >
                    <option value="">اختر المرحلة</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 block pr-2">
                    الصف
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-sm"
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        classId: e.target.value, 
                        courseId: "", 
                        chapterId: "" 
                      })
                    }
                    required
                  >
                    <option value="">اختر الصف</option>
                    {filteredClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 block pr-2">
                  المادة
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-sm"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value, chapterId: "" })
                  }
                  required
                >
                  <option value="">اختر المادة</option>
                  {filteredCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 block pr-2">
                  الباب
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-sm"
                  value={formData.chapterId}
                  onChange={(e) =>
                    setFormData({ ...formData, chapterId: e.target.value })
                  }
                  required
                >
                  <option value="">اختر الباب</option>
                  {filteredChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 block pr-2">
                    عدد الأكواد
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-sm"
                    value={generateCount}
                    onChange={(e) => setGenerateCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 block pr-2">
                    عدد المستخدمين للكود
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-bold transition-all text-sm"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 border-2 border-slate-100 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-[#C4963A] to-[#d4a84a] shadow-lg shadow-[#E8C87A] hover:from-[#b8872e] hover:to-[#c4963a] transition-all"
                >
                  توليد الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
