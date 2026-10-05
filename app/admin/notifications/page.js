"use client";

import React, { useState } from "react";
import { Send, Bell, Trash, Users, School, GraduationCap, Clock } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function NotificationsManagement() {
  const {
    notifications,
    categories,
    classes,
    addNotification,
    deleteNotification,
  } = useGlobalStore();

  const [targetType, setTargetType] = useState("all"); // all, category, class
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newNotif = {
      title: formData.get("title"),
      message: formData.get("message"),
      targetType: targetType,
      categoryId: targetType !== "all" ? parseInt(selectedCategory) : null,
      classId: targetType === "class" ? parseInt(selectedClass) : null,
    };

    addNotification(newNotif);
    e.target.reset();
    setTargetType("all");
    setSelectedCategory("");
    setSelectedClass("");
  };

  const getTargetLabel = (notif) => {
    if (notif.targetType === "all") return "جميع الطلاب";
    if (notif.targetType === "category") {
      const cat = categories.find(c => c.id === notif.categoryId);
      return cat ? `طلاب المرحلة: ${cat.name}` : "مرحلة غير معروفة";
    }
    if (notif.targetType === "class") {
      const cls = classes.find(c => c.id === notif.classId);
      return cls ? `طلاب صف: ${cls.name}` : "صف غير معروف";
    }
    return "غير معروف";
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Bell className="text-[#C4963A]" />
          إرسال إشعارات وتنبيهات
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          قم بإرسال رسائل وتنبيهات تصل للطلاب في حساباتهم الشخصية.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composition Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Send size={18} className="text-[#C4963A]" />
              إرسال إشعار جديد
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">عنوان التنبيه</label>
                <input
                  type="text"
                  name="title"
                  placeholder="مثال: موعد الحصة القادمة"
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C4963A]/20 focus:border-[#C4963A] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نص الرسالة</label>
                <textarea
                  name="message"
                  placeholder="اكتب تفاصيل الإشعار هنا..."
                  required
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C4963A]/20 focus:border-[#C4963A] outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">من يستلم الإشعار؟</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                    {["all", "category", "class"].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setTargetType(type)}
                            className={`py-2 text-xs font-bold rounded-lg transition-all ${
                                targetType === type 
                                ? "bg-white text-[#C4963A] shadow-sm" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {type === "all" ? "الكل" : type === "category" ? "مرحلة" : "صف"}
                        </button>
                    ))}
                </div>

                {targetType !== "all" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedClass("");
                                }}
                                required
                                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C4963A]/20 focus:border-[#C4963A] outline-none transition-all bg-white"
                            >
                                <option value="">اختر المرحلة التعليمية...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {targetType === "class" && selectedCategory && (
                            <div>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    required
                                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C4963A]/20 focus:border-[#C4963A] outline-none transition-all bg-white"
                                >
                                    <option value="">اختر الصف الدراسي...</option>
                                    {classes
                                        .filter(c => c.categoryId === parseInt(selectedCategory))
                                        .map((cls) => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#C4963A] hover:bg-[#b8872e] text-white font-black rounded-2xl shadow-lg shadow-[#E8C87A] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Send size={18} />
                إرسال الإشعار الآن
              </button>
            </form>
          </div>
        </div>

        {/* History / List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
            <Clock size={20} className="text-slate-400" />
            سجل الإشعارات المرسلة
          </h2>

          <div className="space-y-4">
            {notifications.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">لا يوجد إشعارات مرسلة بعد.</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div key={notif.id} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-[#FDF8F0] group-hover:text-[#C4963A] transition-colors">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#C4963A] transition-colors">
                                        {notif.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                            {notif.targetType === "all" ? <Users size={12}/> : notif.targetType === "category" ? <School size={12}/> : <GraduationCap size={12}/>}
                                            {getTargetLabel(notif)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(notif.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => deleteNotification(notif.id)}
                                className="p-2 text-slate-300 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-xl transition-all"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-semibold mr-13">
                            {notif.message}
                        </p>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
