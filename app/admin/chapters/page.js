"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Library,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function ChaptersManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");

  const { chapters, courses, classes, addChapter, updateChapter, deleteChapter } =
    useGlobalStore();

  const handleAddChapter = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newChapter = {
      name: formData.get("name"),
      courseId: parseInt(formData.get("courseId"), 10),
      lessonsCount: parseInt(formData.get("lessonsCount"), 10),
      image: uploadedImage || "https://images.unsplash.com/photo-1546410531-bea5aadcb6ce?w=400&h=300&fit=crop",
      price: parseFloat(formData.get("price")) || 0,
      active: formData.get("isActive") === "on",

    };
    addChapter(newChapter);
    setShowAddModal(false);
  };

  const handleUpdateChapter = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedChapter = {
      name: formData.get("name"),
      courseId: parseInt(formData.get("courseId"), 10),
      lessonsCount: parseInt(formData.get("lessonsCount"), 10),
      image: uploadedImage || "https://images.unsplash.com/photo-1546410531-bea5aadcb6ce?w=400&h=300&fit=crop",
      price: parseFloat(formData.get("price")) || 0,
      active: formData.get("isActive") === "on",

    };
    updateChapter(editingChapter.id, updatedChapter);
    setEditingChapter(null);
  };

  const filteredChapters = chapters.filter((c) => c.name.includes(searchTerm));

  const getCourseName = (id) =>
    courses.find((c) => c.id === id)?.name || "كورس غير معروف";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            إدارة أبواب وفصول المواد
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            إضافة وتعديل الأبواب (الفصول) والدروس الخاصة بكل مادة/كورس.
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
          إضافة باب جديد
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن باب أو فصل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:border-[#C4963A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 group relative overflow-hidden"
          >
            <div className="w-24 h-24 rounded-2xl shrink-0 overflow-hidden border border-slate-200 shadow-sm relative">
                <img
                    src={chapter.image}
                    alt={chapter.name}
                    className={`w-full h-full object-cover transition-all ${!chapter.active && 'grayscale opacity-50'}`}
                />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-slate-800">
                  {chapter.name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap mr-2 ${chapter.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {chapter.active ? "مفعل" : "مغلق"}
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 w-fit">
                  <Library className="w-4 h-4 text-slate-400" />
                  <span className="font-bold">
                    {getCourseName(chapter.courseId)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 w-fit">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="font-bold">
                    {chapter.lessonsCount} دروس
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C4963A] bg-[#FDF8F0] rounded-lg px-3 py-2 w-fit">
                   <span className="font-black">
                     {chapter.price > 0 ? `${chapter.price} ج.م` : "مجاناً"}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:justify-start">
              <button
                onClick={() => {
                  setEditingChapter(chapter);
                  setUploadedImage(chapter.image || "");
                }}
                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteChapter(chapter.id)}
                className="p-2 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {filteredChapters.length === 0 && (
          <p className="col-span-full text-center text-slate-500 py-10">
            لا توجد أبواب مسجلة.
          </p>
        )}
      </div>

      {(showAddModal || editingChapter) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {editingChapter
                ? "تعديل بيانات الباب"
                : "إضافة باب دراسي جديد"}
            </h2>

            <form
              onSubmit={editingChapter ? handleUpdateChapter : handleAddChapter}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  اسم الباب / الفصل
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingChapter ? editingChapter.name : ""}
                  placeholder="مثال: الباب الأول - الكهربية"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  المادة الدراسية (الكورس)
                </label>
                <select
                  name="courseId"
                  required
                  defaultValue={editingChapter ? editingChapter.courseId : ""}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 outline-none bg-white"
                >
                  <option value="">اختر المادة...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  عدد الدروس داخل الباب
                </label>
                <input
                  name="lessonsCount"
                  type="number"
                  min="0"
                  required
                  defaultValue={editingChapter ? editingChapter.lessonsCount : 0}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  السعر (بالجنية المصري) - 0 للمجاني
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editingChapter ? editingChapter.price : 0}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة الباب (اختياري)
                </label>
                <ImageUpload value={uploadedImage} onChange={setUploadedImage} />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={editingChapter ? editingChapter.active : true}
                  className="w-5 h-5 accent-[#C4963A] rounded"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-bold text-slate-700"
                >
                  تفعيل الباب وظهوره للطلاب
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 font-bold text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-lg shadow-[#1B3668]/20"
                >
                  {editingChapter ? "حفظ التعديلات" : "إضافة الباب"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingChapter(null);
                    setUploadedImage("");
                  }}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
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
