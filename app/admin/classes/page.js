"use client";

import React, { useState } from "react";
import { Plus, BookOpen, Clock, Users, Edit3, Trash } from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function ClassesManagement() {
  const [editingClass, setEditingClass] = useState(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");

  const {
    classes: classesList,
    categories,
    addClass,
    updateClass,
    deleteClass,
  } = useGlobalStore();

  const handleAddClass = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newClass = {
      name: formData.get("name"),
      categoryId: parseInt(formData.get("categoryId"), 10),
      image: uploadedImage,
      active: formData.get("isActive") === "on",
    };
    addClass(newClass);
    setShowAddClassModal(false);
    setUploadedImage("");
  };

  const handleUpdateClass = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedClass = {
      name: formData.get("name"),
      categoryId: parseInt(formData.get("categoryId"), 10),
      image: uploadedImage,
      active: formData.get("isActive") === "on",
    };
    updateClass(editingClass.id, updatedClass);
    setEditingClass(null);
    setUploadedImage("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            إدارة الصفوف الدراسية
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            التحكم في الأقسام والمراحل الدراسية المتاحة على المنصة.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddClassModal(true);
            setUploadedImage("");
          }}
          className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-[#C4963A]" />
          إضافة صف جديد
        </button>
      </div>

      {/* Classes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classesList.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-[20px] flex flex-col overflow-hidden border border-slate-100 shadow-sm hover:shadow-teal-500/20 hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative h-[180px] overflow-hidden bg-slate-100">
              {cls.image ? (
                <img
                  src={cls.image}
                  alt={cls.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <BookOpen className="w-14 h-14 text-slate-400" />
                </div>
              )}
              {/* Active badge */}
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${
                  cls.active
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {cls.active ? "مفعل" : "مغلق"}
              </span>
            </div>

            {/* Info */}
            <div className="px-5 py-4 flex flex-col gap-2 relative">
              {/* Teal accent line on hover */}
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors text-right">
                {cls.name}
              </h3>

              <div className="w-full h-px bg-slate-100" />

              <p className="text-sm text-slate-500 font-medium text-right">
                {categories.find((cat) => cat.id === cls.categoryId)?.name || "فئة غير معروفة"}
              </p>

              <div className="flex gap-3 text-xs text-slate-400 font-bold justify-end mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {(cls.studentsCount || 0).toLocaleString("en-US")} طالب
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {cls.coursesCount || 0} كورس
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                <button
                  onClick={() => {
                    setEditingClass(cls);
                    setUploadedImage(cls.image || "");
                  }}
                  className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> تعديل
                </button>
                <button
                  onClick={() => deleteClass(cls.id)}
                  className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash className="w-4 h-4" /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Class Modal */}
      {(showAddClassModal || editingClass) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {editingClass ? "تعديل بيانات الصف" : "إضافة صف دراسي جديد"}
            </h2>

            <form
              className="space-y-6"
              onSubmit={editingClass ? handleUpdateClass : handleAddClass}
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  اسم الصف الدراسي
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingClass ? editingClass.name : ""}
                  placeholder="مثال: الصف الأول الإعدادي"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  يتبع الفئة الدراسية
                </label>
                <select
                  name="categoryId"
                  defaultValue={editingClass ? editingClass.categoryId : ""}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none bg-white"
                  required
                >
                  <option value="">اختر الفئة الدراسية...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة الصف الدراسي (اختياري)
                </label>
                <ImageUpload value={uploadedImage} onChange={setUploadedImage} />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={editingClass ? editingClass.active : true}
                  className="w-5 h-5 accent-[#1B3668] border-slate-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-bold text-slate-700"
                >
                  تفعيل الصف مباشرة
                </label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 font-bold text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-md transition-all shadow-[#1B3668]/20"
                >
                  {editingClass ? "حفظ التعديلات" : "إضافة الصف"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddClassModal(false);
                    setEditingClass(null);
                    setUploadedImage("");
                  }}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
