"use client";

import React, { useState, useRef } from "react";
import { Save, Globe, Smartphone, Mail, MapPin, Camera, User } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function AdminSettings() {
  const { currentUser, updateUser } = useGlobalStore();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  
  const [settings, setSettings] = useState({
    siteName: "Bridge Academy",
    // siteDescription: "منصة فاهم التعليمية للمرحلة الثانوية والإعدادية",
    contactEmail: "",
    contactPhone: "",
    address: " مصر",
  });

  const [logo, setLogo] = useState(null);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          updateUser(currentUser.id, { image: reader.result });
        } else {
          setLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert("تم حفظ إعدادات الموقع بنجاح! تم تحديث بيانات التواصل.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إعدادات المنصة</h1>
          <p className="text-slate-500 mt-2 font-medium">تحكم في المعلومات الأساسية والروابط الخاصة بالمنصة .</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-4 bg-[#C4963A] text-white rounded-2xl font-black shadow-lg shadow-[#E8C87A] hover:bg-[#b8872e] transition-all flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          حفظ الكل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Admin Profile Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-[#C4963A]" />
              بروفيل المدير
            </h3>
            
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative group">
                    <img 
                        src={currentUser?.image || "https://i.pravatar.cc/150?u=admin"} 
                        alt="Admin" 
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md transition-transform group-hover:scale-105"
                    />
                    <button 
                        onClick={() => avatarInputRef.current.click()}
                        className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                        <Camera className="w-6 h-6" />
                    </button>
                    <input 
                        type="file" 
                        ref={avatarInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                </div>
                <div>
                    <p className="text-xl font-black text-slate-800">{currentUser?.name}</p>
                    <p className="text-slate-500 font-bold">{currentUser?.email}</p>
                    <button 
                        onClick={() => avatarInputRef.current.click()}
                        className="mt-2 text-sm font-black text-[#C4963A] hover:text-[#b8872e]"
                    >
                        تغيير الصورة الشخصية
                    </button>
                </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#C4963A]" />
              هوية الموقع
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموقع</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-[#C4963A]/20 focus:border-[#C4963A] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">وصف المنصة</label>
                <textarea 
                  rows="3"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold focus:ring-2 focus:ring-[#C4963A]/20 focus:border-[#C4963A] outline-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
             <h3 className="text-lg font-black text-slate-800 mb-6">Logo المنصة</h3>
             <div 
                onClick={() => fileInputRef.current.click()}
                className="w-32 h-32 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 mx-auto flex flex-col items-center justify-center gap-2 text-slate-400 group hover:border-[#C4963A] cursor-pointer transition-all overflow-hidden"
             >
                {logo ? (
                    <img src={logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                ) : (
                    <>
                        <Camera className="w-8 h-8 group-hover:text-[#C4963A]" />
                        <span className="text-[10px] font-bold">تغيير الشعار</span>
                    </>
                )}
             </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
             />
             <p className="mt-4 text-[11px] font-bold text-slate-400">يفضل استخدام صورة PNG بخلفية شفافة</p>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C4963A]" />
              بيانات التواصل
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">البريد</label>
                    <input 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">الهاتف</label>
                    <input 
                    type="text" 
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                    />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
