"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ShieldCheck,
  Mail,
  Phone,
  UploadCloud,
  X,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function TeachersManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const { teachers, addTeacher, updateTeacher, deleteTeacher } =
    useGlobalStore();

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTeacher = {
      id: Date.now(),
      name: formData.get("name"),
      subject: formData.get("subject"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      bio: formData.get("bio"),
      students: 0,
      status: "نشط",
      image:
        imagePreview ||
        "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70), // Fallback
    };
    addTeacher(newTeacher);
    closeModal();
  };

  const handleUpdateTeacher = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedTeacher = {
      name: formData.get("name"),
      subject: formData.get("subject"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      bio: formData.get("bio"),
    };
    if (imagePreview) {
      updatedTeacher.image = imagePreview;
    }
    updateTeacher(editingTeacher.id, updatedTeacher);
    closeModal();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTeacher(null);
    setImagePreview("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة المدرسين</h1>
          <p className="text-slate-500 mt-2 font-medium">
            إضافة وتعديل وحذف بيانات المعلمين في المنصة.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-[#C4963A]" />
          إضافة مدرس جديد
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن مدرس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-[#C4963A]/20 transition-all group"
          >
            {/* Top Colors & Image */}
            <div className="h-24 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] relative">
              <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingTeacher(teacher);
                    setImagePreview(teacher.image);
                  }}
                  className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTeacher(teacher.id)}
                  className="p-2 bg-white/20 hover:bg-[#C4963A] hover:text-white backdrop-blur-md rounded-lg text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="px-6 relative -mt-12">
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-sm bg-slate-100"
              />
              <span
                className={`absolute top-2 left-6 px-3 py-1 text-xs font-bold rounded-full ${
                  teacher.status === "نشط"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {teacher.status}
              </span>
            </div>

            {/* Info */}
            <div className="p-6 pt-4">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#C4963A] transition-colors">
                {teacher.name}
              </h3>
              <p className="text-sm font-bold text-[#C4963A] mb-4">
                {teacher.subject}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span dir="ltr" className="text-right">
                    {teacher.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{teacher.email}</span>
                </div>
              </div>

              {/* Stats Bottom */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-center">
                  <span className="block text-xl font-black text-slate-800">
                    {teacher.students.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    طالب مسجل
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-center">
                  <span className="block text-xl font-black text-green-500">
                    98%
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    تقييم إيجابي
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Teacher Modal */}
      {(showAddModal || editingTeacher) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              {editingTeacher ? "تعديل بيانات المدرس" : "إضافة مدرس جديد"}
            </h2>

            <form
              className="space-y-6"
              onSubmit={editingTeacher ? handleUpdateTeacher : handleAddTeacher}
            >
              <div className="md:col-span-2 mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة المدرس (اختياري)
                </label>
                <ImageUpload value={imagePreview} onChange={setImagePreview} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    اسم المدرس
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTeacher ? editingTeacher.name : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    المادة العلمية
                  </label>
                  <input
                    type="text"
                    name="subject"
                    defaultValue={editingTeacher ? editingTeacher.subject : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingTeacher ? editingTeacher.phone : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingTeacher ? editingTeacher.email : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    النبذة (Bio)
                  </label>
                  <textarea
                    rows="3"
                    name="bio"
                    defaultValue={editingTeacher ? editingTeacher.bio : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] transition-all outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-8 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 font-bold text-white bg-[#C4963A] hover:bg-[#C4963A] rounded-xl shadow-lg shadow-[#C4963A]/20 transition-all"
                >
                  {editingTeacher ? "حفظ التعديلات" : "حفظ المدرس"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
