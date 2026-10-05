"use client";

import React, { useMemo } from "react";
import { useGlobalStore } from "@/lib/store";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  PlayCircle,
  Video
} from "lucide-react";

export default function AdminDashboard() {
  const { users, teachers, classes, lessonViews, lessons } = useGlobalStore();

  const stats = useMemo(() => {
    const students = users.filter(u => u.role !== "admin");
    const activeTeachers = teachers.filter(t => t.status === "نشط");
    const today = new Date().toDateString();
    const todayViews = (lessonViews || []).filter(v => 
      v.timestamp && new Date(v.timestamp).toDateString() === today
    ).length;

    return [
        {
          title: "إجمالي الطلاب",
          value: students.length.toLocaleString(),
          increase: "+100%", 
          icon: Users,
          color: "text-[#1B3668]",
          bg: "bg-[#1B3668]/10",
          trend: "text-emerald-600",
        },
        {
          title: "المدرسين النشطين",
          value: activeTeachers.length.toString(),
          increase: "معادلة الهندسة",
          icon: GraduationCap,
          color: "text-[#C4963A]",
          bg: "bg-[#C4963A]/15",
          trend: "text-emerald-600",
        },
        {
          title: "إجمالي المحاضرات",
          value: lessons.length.toString(),
          increase: "مباشر",
          icon: Video,
          color: "text-blue-600",
          bg: "bg-blue-50",
          trend: "text-[#C4963A]",
        },
        {
          title: "مشاهدات اليوم",
          value: todayViews.toLocaleString(),
          increase: "+100%",
          icon: TrendingUp,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          trend: "text-emerald-600",
        }
    ];
  }, [users, teachers, classes, lessonViews, lessons]);

  const recentActivity = useMemo(() => {
    const registrations = users.filter(u => u.role === "student").map(u => ({
        user: u.name,
        action: "تسجيل طالب جديد بالمنصة",
        type: "student",
        timestamp: u.createdAt || u.id,
    }));

    const views = (lessonViews || []).slice(-10).map(v => {
        const user = users.find(u => u.id === v.userId);
        const lesson = lessons.find(l => l.id === v.lessonId);
        return {
            user: user?.name || "طالب",
            action: `شاهد محاضرة: ${lesson?.name || "محاضرة"}`,
            type: "view",
            timestamp: v.timestamp,
        };
    });

    const combined = [...registrations, ...views].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return combined.slice(0, 5);
  }, [users, lessonViews, lessons]);

  // Chart Logic (Mocking last 7 days for the curve)
  const chartData = useMemo(() => {
    const days = ["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const today = new Date().getDay();
    const last7Days = [];
    for(let i=6; i>=0; i--) {
        const d = (today - i + 7) % 7;
        last7Days.push(days[d]);
    }

    // Points for SVG (normalized 0-100)
    const points = [15, 30, 45, 35, 65, 85, 95]; 
    return { labels: last7Days, points };
  }, []);

  const formatTime = (ts) => {
    const diff = new Date() - new Date(ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return new Date(ts).toLocaleDateString("ar-EG");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#122040]">نظرة عامة — Bridge Academy</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            مرحباً بك مجدداً في لوحة التحكم، إليك ملخص أداء المنصة والنشاط الأكاديمي.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1B3668] bg-white border border-[#EAE3D6] px-4 py-2 rounded-xl shadow-sm">
          <Calendar className="w-4 h-4 text-[#C4963A]" />
          <span>{new Date().toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-[#EAE3D6] hover:shadow-md hover:border-[#C4963A]/40 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-50 ${stat.trend}`}
                >
                  {stat.increase} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-slate-500 font-semibold text-sm mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-black text-[#122040]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-[#EAE3D6]">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-xl font-black text-[#122040]">نشاط منصة Bridge Academy</h2>
                 <p className="text-slate-400 text-sm font-semibold">تفاعل الطلاب مع المحاضرات (آخر 7 أيام)</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <div className="w-3 h-3 rounded-full bg-[#1B3668]" />
                    المشاهدات اليومية
                 </div>
              </div>
           </div>

           <div className="relative h-64 w-full">
              {/* SVG Curve Chart */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                 <defs>
                    <linearGradient id="gradNavy" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" style={{stopColor:'rgb(27, 54, 104)', stopOpacity:0.25}} />
                       <stop offset="100%" style={{stopColor:'rgb(27, 54, 104)', stopOpacity:0}} />
                    </linearGradient>
                 </defs>
                 
                 {/* Area under curve */}
                 <path 
                    d={`M 0 200 L 0 ${200 - chartData.points[0]*2} C 100 ${200 - chartData.points[1]*2}, 200 ${200 - chartData.points[2]*2}, 300 ${200 - chartData.points[3]*2}, 400 ${200 - chartData.points[4]*2}, 500 ${200 - chartData.points[5]*2}, 600 ${200 - chartData.points[6]*2} L 700 ${200 - chartData.points[6]*2} L 700 200 Z`}
                    fill="url(#gradNavy)"
                 />

                 {/* The Line */}
                 <path 
                    d={`M 0 ${200 - chartData.points[0]*2} C 100 ${200 - chartData.points[1]*2}, 200 ${200 - chartData.points[2]*2}, 300 ${200 - chartData.points[3]*2}, 400 ${200 - chartData.points[4]*2}, 500 ${200 - chartData.points[5]*2}, 600 ${200 - chartData.points[6]*2} L 700 ${200 - chartData.points[6]*2}`}
                    fill="none"
                    stroke="#1B3668"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                 />
              </svg>

              {/* Day Labels */}
              <div className="flex justify-between mt-4">
                 {chartData.labels.map(l => (
                    <span key={l} className="text-[11px] font-bold text-slate-400">{l}</span>
                 ))}
              </div>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#EAE3D6]">
          <h2 className="text-xl font-black text-[#122040] mb-8 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-[#C4963A]" />
            آخر الأنشطة والتفاعلات
          </h2>
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className="relative flex items-start gap-4 pr-3">
                {/* Vertical Line Connector */}
                {i !== recentActivity.length - 1 && (
                    <div className="absolute top-7 bottom-[-16px] right-[10px] w-0.5 bg-slate-100" />
                )}
                
                <div
                  className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full z-10 ${activity.type === "student" ? "bg-[#1B3668] shadow-sm shadow-[#1B3668]" : "bg-[#C4963A] shadow-sm shadow-[#C4963A]"}`}
                ></div>
                <div className="pr-1 flex-1">
                  <p className="text-sm font-black text-[#122040] leading-tight">
                    {activity.user}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">{activity.action}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[#C4963A] font-bold">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            )) : (
                <div className="text-center py-10">
                    <p className="text-slate-400 font-bold text-sm">لا يوجد نشاط مسجل حالياً</p>
                </div>
            )}
          </div>
          <button className="w-full mt-8 py-3.5 bg-[#F8F5F0] hover:bg-[#F0EBE1] rounded-2xl text-[#1B3668] font-bold transition-all text-sm border border-[#EAE3D6]">
            مراقبة التفاعل المباشر
          </button>
        </div>
      </div>
    </div>
  );
}
