"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, Edit2, BookOpen } from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function CategoriesManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const { categories, addCategory, updateCategory, deleteCategory } =
    useGlobalStore();

  const handleAddCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addCategory({ 
      name: formData.get("name"),
      image: uploadedImage
    });
    setShowAddModal(false);
    setUploadedImage("");
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateCategory(editingCategory.id, { 
      name: formData.get("name"),
      image: uploadedImage
    });
    setEditingCategory(null);
    setUploadedImage("");
  };

  const filteredCategories = categories.filter((c) =>
    c.name.includes(searchTerm),
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#122040]">
            الفئات الدراسية
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            إدارة المراحل والتخصصات الأكاديمية لمعادلة كلية الهندسة في Bridge Academy.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setUploadedImage("");
          }}
          className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-[#C4963A]" />
          إضافة فئة جديدة
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE3D6]">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن فئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8F5F0] border border-[#EAE3D6] rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3668]/20 focus:border-[#1B3668]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-[24px] p-6 border border-[#EAE3D6] shadow-sm hover:shadow-md hover:border-[#C4963A]/40 transition-all flex gap-4 items-center group overflow-hidden"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F8F5F0] border border-[#EAE3D6] flex items-center justify-center shrink-0">
               {cat.image ? (
                 <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
               ) : (
                 <BookOpen className="w-8 h-8 text-[#1B3668]" />
               )}
            </div>
            <h3 className="text-xl font-black text-[#122040] flex-1">{cat.name}</h3>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setUploadedImage(cat.image || "");
                }}
                className="p-2 text-slate-400 hover:text-[#1B3668] hover:bg-[#1B3668]/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="p-2 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="col-span-full text-center text-slate-500 py-10 font-bold">
            لا توجد فئات دراسية مسجلة.
          </p>
        )}
      </div>

      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 border border-[#EAE3D6]">
            <h2 className="text-2xl font-black text-[#122040] mb-6">
              {editingCategory ? "تعديل فئة دراسية" : "إضافة فئة دراسية"}
            </h2>
            <form
              onSubmit={
                editingCategory ? handleUpdateCategory : handleAddCategory
              }
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  اسم الفئة
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCategory ? editingCategory.name : ""}
                  placeholder="مثال: معادلة هندسة دبلوم 3 سنوات"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#1B3668] focus:ring-1 focus:ring-[#1B3668] outline-none mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة الفئة (المرحلة)
                </label>
                <ImageUpload value={uploadedImage} onChange={setUploadedImage} />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setUploadedImage("");
                  }}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 font-bold text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-lg shadow-[#1B3668]/20"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
