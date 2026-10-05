"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit2,
  GraduationCap,
  School,
  Layers,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function CoursesManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");

  const { courses, categories, classes, teachers, addCourse, updateCourse, deleteCourse } =
    useGlobalStore();

  const handleAddCourse = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCourse = {
      name: formData.get("name"),
      categoryId: parseInt(formData.get("categoryId"), 10),
      teacherId: parseInt(formData.get("teacherId"), 10),
      image: uploadedImage || "",
      active: formData.get("isActive") === "on",
    };
    addCourse(newCourse);
    setShowAddModal(false);
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedCourse = {
      name: formData.get("name"),
      categoryId: parseInt(formData.get("categoryId"), 10),
      teacherId: parseInt(formData.get("teacherId"), 10),
      image: uploadedImage || "",
      active: formData.get("isActive") === "on",
    };
    updateCourse(editingCourse.id, updatedCourse);
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter((c) => c.name.includes(searchTerm));

  const getCategoryName = (course) => {
    const catId = course.categoryId || classes.find(c => c.id === course.classId)?.categoryId;
    return categories.find((c) => c.id === catId)?.name || "كورس غير محدد";
  };
  const getTeacherName = (id) =>
    teachers.find((t) => t.id === id)?.name || "مدرس غير معروف";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            إدارة المواد الدراسية
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            التحكم في المواد والكورسات المربوطة بالصفوف والمدرسين.
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
          إضافة مادة جديدة
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن مادة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:border-[#C4963A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 group relative overflow-hidden"
          >
            <div
              className={`w-16 h-16 rounded-[16px] flex items-center justify-center shrink-0 overflow-hidden relative ${course.active ? "bg-[#FDF8F0] text-[#C4963A] border border-[#F0DDB8]" : "bg-slate-50 text-slate-400 border border-slate-200"}`}
            >
              {course.image ? (
                <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-slate-800">
                  {course.name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${course.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {course.active ? "مفعل" : "مغلق"}
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 w-fit">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="font-bold">
                    {getCategoryName(course)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 w-fit">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="font-bold">
                    {getTeacherName(course.teacherId)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:justify-start">
              <button
                onClick={() => {
                  setEditingCourse(course);
                  setUploadedImage(course.image || "");
                }}
                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteCourse(course.id)}
                className="p-2 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && (
          <p className="col-span-full text-center text-slate-500 py-10">
            لا توجد مواد مسجلة.
          </p>
        )}
      </div>

      {(showAddModal || editingCourse) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {editingCourse
                ? "تعديل المادة الدراسية"
                : "إضافة مادة دراسية جديدة"}
            </h2>

            <form
              onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  اسم المادة / الكورس
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCourse ? editingCourse.name : ""}
                  placeholder="مثال: فيزياء المراجعة النهائية"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  الكورس / المرحلة
                </label>
                <select
                  name="categoryId"
                  required
                  defaultValue={editingCourse ? (editingCourse.categoryId || classes.find(c => c.id === editingCourse.classId)?.categoryId || "") : ""}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 outline-none bg-white"
                >
                  <option value="">اختر الكورس / المرحلة...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  مدرس المادة
                </label>
                <select
                  name="teacherId"
                  required
                  defaultValue={editingCourse ? editingCourse.teacherId : ""}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 outline-none bg-white"
                >
                  <option value="">اختر المدرس...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة المادة (اختياري)
                </label>
                <ImageUpload value={uploadedImage} onChange={setUploadedImage} />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  defaultChecked={editingCourse ? editingCourse.active : true}
                  className="w-5 h-5 accent-[#C4963A] rounded"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-bold text-slate-700"
                >
                  تفعيل المادة مباشرة
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 font-bold text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-lg shadow-[#1B3668]/20"
                >
                  {editingCourse ? "حفظ التعديلات" : "إضافة المادة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCourse(null);
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
