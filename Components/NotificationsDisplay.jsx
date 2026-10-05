"use client";

import React from "react";
import { Bell, Clock, Info } from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import { motion, AnimatePresence } from "motion/react";

export default function NotificationsDisplay() {
  const { notifications, currentUser, dismissedNotifications, dismissNotification } = useGlobalStore();

  if (!currentUser || currentUser.role === "admin") return null;

  // Filter notifications based on student profile and dismissal status
  const relevantNotifications = notifications.filter((notif) => {
    // Check if dismissed
    const isDismissed = dismissedNotifications.some(d => d.notificationId === notif.id && d.userId === currentUser.id);
    if (isDismissed) return false;

    if (notif.targetType === "all") return true;
    if (notif.targetType === "category" && notif.categoryId === currentUser.categoryId) return true;
    if (notif.targetType === "class" && notif.classId === currentUser.classId) return true;
    return false;
  }).slice(0, 3);

  if (relevantNotifications.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="text-[#C4963A] animate-swing" size={24} />
        <h2 className="text-2xl font-black text-slate-800">أحدث التنبيهات</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {relevantNotifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 border-r-4 border-[#C4963A] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#C4963A]/10 rounded-full blur-3xl opacity-20 -translate-x-12 -translate-y-12"></div>
              
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#C4963A] transition-colors">
                  {notif.title}
                </h3>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(notif.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                    </span>
                    <button 
                        onClick={() => dismissNotification(currentUser.id, notif.id)}
                        className="text-[10px] font-bold text-slate-300 hover:text-[#C4963A] transition-colors"
                    >
                        إخفاء
                    </button>
                </div>
              </div>
              
              <p className="text-slate-600 font-semibold leading-relaxed text-sm">
                {notif.message}
              </p>

              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#C4963A] bg-[#C4963A]/10 w-fit px-2 py-1 rounded-lg">
                <Info size={12} />
                تنبيه هام
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <style jsx>{`
        @keyframes swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}
