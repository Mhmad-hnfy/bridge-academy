"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

// Create the Context
const GlobalContext = createContext(null);

const defaultData = {
  categories: [],
  teachers: [],
  classes: [],
  courses: [],
  chapters: [],
  lessons: [],
  codes: [],
  users: [],
  currentUser: null,
  currentParent: null,
  unlockedChapters: [],
  lessonViews: [],
  viewCounts: [],
  notifications: [],
  dismissedNotifications: [],
};

// Helper to convert snake_case object to camelCase
const toCamel = (obj) => {
  if (!obj) return obj;
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

// Helper to convert camelCase object to snake_case
const toSnake = (obj) => {
  if (!obj) return obj;
  const newObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

export const GlobalProvider = ({ children }) => {
  const [data, setData] = useState(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withLoading = async (action) => {
    setIsSubmitting(true);
    try {
      await action();
    } catch (err) {
      console.error("Action error:", err);
      alert("حدث خطأ أثناء العملية، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extracted fetchData so it can be called from anywhere (e.g., after code verification)
  const fetchData = React.useCallback(async () => {
    try {
      const [
        { data: categories },
        { data: teachers },
        { data: classes },
        { data: courses },
        { data: chapters },
        { data: lessons },
        { data: codes },
        { data: users },
        { data: unlockedChapters },
        { data: lessonViews },
        { data: viewCounts },
        { data: notifications },
        { data: dismissedNotifications },
      ] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("teachers").select("*"),
        supabase.from("classes").select("*"),
        supabase.from("courses").select("*"),
        supabase.from("chapters").select("*"),
        supabase.from("lessons").select("*").order("id", { ascending: true }),
        supabase.from("codes").select("*"),
        // SECURITY: password field is intentionally excluded — never sent to client
        supabase.from("users").select("id, name, phone, email, role, status, class_id, category_id, parent_phone, whatsapp, parent_whatsapp, school_name, religion, gender, birth_date, notes, father_job, father_phone, discount_code, created_at"),
        supabase.from("unlocked_chapters").select("*"),
        supabase.from("lesson_views").select("*"),
        supabase.from("view_counts").select("*"),
        supabase.from("notifications").select("*"),
        supabase.from("dismissed_notifications").select("*"),
      ]);

      const savedUser = localStorage.getItem("fahemCurrentUser");
      const savedParent = localStorage.getItem("fahemCurrentParent");
      let parsedUser = null;
      let parsedParent = null;
      if (savedUser) {
         try { parsedUser = JSON.parse(savedUser); } catch(e){}
      }
      if (savedParent) {
         try { parsedParent = JSON.parse(savedParent); } catch(e){}
      }

      setData((prev) => ({
        ...prev,
        categories: categories?.map(toCamel) || [],
        teachers: teachers?.map(toCamel) || [],
        classes: classes?.map(toCamel) || [],
        courses: (courses?.map(toCamel) || []).map(crs => {
          const matchingClass = (classes || []).find(c => c.id === crs.classId);
          return {
            ...crs,
            categoryId: crs.categoryId || (matchingClass ? matchingClass.category_id || matchingClass.categoryId : null)
          };
        }),
        chapters: chapters?.map(toCamel) || [],
        lessons: (lessons?.map(toCamel) || []).sort((a, b) => {
          const orderA = a.sortOrder !== undefined && a.sortOrder !== null ? a.sortOrder : a.id;
          const orderB = b.sortOrder !== undefined && b.sortOrder !== null ? b.sortOrder : b.id;
          return orderA - orderB;
        }),
        codes: codes?.map(toCamel) || [],
        users: users?.map(toCamel) || [],
        unlockedChapters: unlockedChapters?.map(toCamel) || [],
        lessonViews: lessonViews?.map(toCamel) || [],
        viewCounts: viewCounts?.map(toCamel) || [],
        notifications: notifications?.map(toCamel) || [],
        dismissedNotifications: dismissedNotifications?.map(toCamel) || [],
        currentUser: parsedUser,
        currentParent: parsedParent,
      }));

      setIsLoaded(true);
    } catch (e) {
      console.error("Error fetching data", e);
      setIsLoaded(true);
    }
  }, []);

  // Load from Supabase on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      if (data.currentUser) {
        localStorage.setItem("fahemCurrentUser", JSON.stringify(data.currentUser));
      } else {
        localStorage.removeItem("fahemCurrentUser");
      }
    }
  }, [data.currentUser, isLoaded]);

  // --- Auth Actions ---
  const adminAddUser = async (user) => {
    const exists = data.users.find((u) => u.email === user.email || u.phone === user.phone);
    if (exists) return { success: false, message: "البريد الإلكتروني أو رقم الهاتف موجود بالفعل" };

    // SECURITY: Hash password before storing — never store plaintext
    const hashedPassword = await bcrypt.hash(user.password, 12);

    const newUser = {
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      whatsapp: user.whatsapp || "",
      nationalId: user.nationalId || "",
      parentPhone: user.parentPhone || "",
      parentWhatsapp: user.parentWhatsapp || "",
      categoryId: user.categoryId || null,
      classId: user.classId || null,
      discountCode: user.discountCode || "",
      schoolName: user.schoolName || "",
      religion: user.religion || "",
      gender: user.gender || "",
      birthDate: user.birthDate || "",
      notes: user.notes || "",
      fatherJob: user.fatherJob || "",
      fatherPhone: user.fatherPhone || "",
      password: hashedPassword, // SECURITY: store bcrypt hash
      role: "student",
      status: "نشط",
    };

    // Select without password — never return password to client
    const { data: insertedUser, error } = await supabase
      .from("users")
      .insert(toSnake(newUser))
      .select("id, name, phone, email, role, status, class_id, category_id, parent_phone, whatsapp, parent_whatsapp, school_name, religion, gender, birth_date, notes, father_job, father_phone, discount_code, national_id, created_at")
      .single();
    
    if (error) {
       console.error(error);
       return { success: false, message: "حدث خطأ في إنشاء الحساب" };
    }

    const camelUser = toCamel(insertedUser);
    setData((prev) => ({
      ...prev,
      users: [...prev.users, camelUser],
    }));
    return { success: true, user: camelUser };
  };

  const registerUser = async (user) => {
    const res = await adminAddUser(user);
    if (res.success) {
      setData((prev) => ({ ...prev, currentUser: res.user }));
    }
    return res;
  };

  // SECURITY: Login is now server-side via API route — password never compared client-side
  const loginUser = async (phone, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const result = await response.json();
      if (result.success) {
        setData((prev) => ({ ...prev, currentUser: result.user }));
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "خطأ في الاتصال بالخادم" };
    }
  };

  const logoutUser = async () => {
    setData((prev) => ({ ...prev, currentUser: null }));
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // --- Teacher Actions ---
  const addTeacher = (teacher) => withLoading(async () => {
    const newTeacher = { ...teacher, students: 0, status: "نشط" };
    const { data: inserted, error } = await supabase.from("teachers").insert(toSnake(newTeacher)).select().single();
    if (!error && inserted) setData((prev) => ({ ...prev, teachers: [...prev.teachers, toCamel(inserted)] }));
  });

  const updateTeacher = (id, updatedFields) => withLoading(async () => {
    const { error } = await supabase.from("teachers").update(toSnake(updatedFields)).eq("id", id);
    if (!error) setData((prev) => ({ ...prev, teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)) }));
  });

  const deleteTeacher = (id) => withLoading(async () => {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (!error) setData((prev) => ({ ...prev, teachers: prev.teachers.filter((t) => t.id !== id) }));
  });

  // --- Category ---
  const addCategory = (cat) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("categories").insert(toSnake(cat)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, categories: [...p.categories, toCamel(inserted)] }));
  });
  const updateCategory = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("categories").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, categories: p.categories.map((c) => (c.id === id ? { ...c, ...fields } : c)) }));
  });
  const deleteCategory = (id) => withLoading(async () => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== id) }));
  });

  // --- Class ---
  const addClass = (cls) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("classes").insert(toSnake(cls)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, classes: [...p.classes, toCamel(inserted)] }));
  });
  const updateClass = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("classes").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, classes: p.classes.map((c) => (c.id === id ? { ...c, ...fields } : c)) }));
  });
  const deleteClass = (id) => withLoading(async () => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, classes: p.classes.filter((c) => c.id !== id) }));
  });

  // --- Course ---
  const addCourse = (crs) => withLoading(async () => {
    let finalClassId = crs.classId;
    if (!finalClassId && crs.categoryId) {
      let existingClass = data.classes.find(c => c.categoryId === crs.categoryId);
      if (!existingClass) {
        const cat = data.categories.find(c => c.id === crs.categoryId);
        const { data: insertedClass } = await supabase.from("classes").insert({
          name: cat ? cat.name : "الصف الافتراضي",
          category_id: crs.categoryId,
          active: true
        }).select().single();
        if (insertedClass) {
          existingClass = toCamel(insertedClass);
          setData(p => ({ ...p, classes: [...p.classes, existingClass] }));
        }
      }
      finalClassId = existingClass?.id;
    }
    const coursePayload = { ...crs };
    if (finalClassId) coursePayload.classId = finalClassId;
    const snakePayload = toSnake(coursePayload);
    delete snakePayload.category_id;
    const { data: inserted, error } = await supabase.from("courses").insert(snakePayload).select().single();
    if (!error && inserted) {
      const camel = toCamel(inserted);
      camel.categoryId = crs.categoryId || (finalClassId ? data.classes.find(c => c.id === finalClassId)?.categoryId : null);
      setData((p) => ({ ...p, courses: [...p.courses, camel] }));
    }
  });

  const updateCourse = (id, fields) => withLoading(async () => {
    let finalClassId = fields.classId;
    if (!finalClassId && fields.categoryId) {
      let existingClass = data.classes.find(c => c.categoryId === fields.categoryId);
      if (!existingClass) {
        const cat = data.categories.find(c => c.id === fields.categoryId);
        const { data: insertedClass } = await supabase.from("classes").insert({
          name: cat ? cat.name : "الصف الافتراضي",
          category_id: fields.categoryId,
          active: true
        }).select().single();
        if (insertedClass) {
          existingClass = toCamel(insertedClass);
          setData(p => ({ ...p, classes: [...p.classes, existingClass] }));
        }
      }
      finalClassId = existingClass?.id;
    }
    const updatePayload = { ...fields };
    if (finalClassId) updatePayload.classId = finalClassId;
    const snakePayload = toSnake(updatePayload);
    delete snakePayload.category_id;
    const { error } = await supabase.from("courses").update(snakePayload).eq("id", id);
    if (!error) setData((p) => ({ ...p, courses: p.courses.map((c) => (c.id === id ? { ...c, ...fields, classId: finalClassId || c.classId, categoryId: fields.categoryId || c.categoryId } : c)) }));
  });

  const deleteCourse = (id) => withLoading(async () => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, courses: p.courses.filter((c) => c.id !== id) }));
  });

  // --- Chapter ---
  const addChapter = (chp) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("chapters").insert(toSnake(chp)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, chapters: [...p.chapters, toCamel(inserted)] }));
  });
  const updateChapter = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("chapters").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, chapters: p.chapters.map((c) => (c.id === id ? { ...c, ...fields } : c)) }));
  });
  const deleteChapter = (id) => withLoading(async () => {
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, chapters: p.chapters.filter((c) => c.id !== id) }));
  });

  // --- Lesson ---
  const addLesson = (lesson) => withLoading(async () => {
    const newLesson = { ...lesson, views: 0, maxViews: lesson.maxViews || 5 };
    const { data: inserted, error } = await supabase.from("lessons").insert(toSnake(newLesson)).select().single();
    if (!error && inserted) setData((prev) => ({ ...prev, lessons: [...prev.lessons, toCamel(inserted)] }));
  });
  const updateLesson = (id, fields) => withLoading(async () => {
    const { error } = await supabase.from("lessons").update(toSnake(fields)).eq("id", id);
    if (!error) setData((p) => ({ ...p, lessons: p.lessons.map((l) => (l.id === id ? { ...l, ...fields } : l)) }));
  });
  const deleteLesson = (id) => withLoading(async () => {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, lessons: p.lessons.filter((l) => l.id !== id) }));
  });

  // --- Code Actions ---
  // SECURITY: Use crypto.getRandomValues instead of Math.random (not cryptographically secure)
  const _generateSecureCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join("");
  };

  const generateCodes = (count, details) => withLoading(async () => {
    const newCodes = [];
    const existingCodeStrings = new Set(data.codes.map((c) => c.code));
    for (let i = 0; i < count; i++) {
        let codeString;
        // Ensure uniqueness
        do { codeString = _generateSecureCode(); } while (existingCodeStrings.has(codeString));
        existingCodeStrings.add(codeString);
        newCodes.push({
            code: codeString,
            classId: details.classId,
            categoryId: details.categoryId,
            chapterId: details.chapterId,
            maxUses: details.maxUses || 1,
            usedCount: 0,
            active: true,
        });
    }
    const { data: inserted, error } = await supabase.from("codes").insert(newCodes.map(toSnake)).select();
    if (!error && inserted) {
      setData((prev) => ({ ...prev, codes: [...prev.codes, ...inserted.map(toCamel)] }));
    }
  });

  const deleteCode = (id) => withLoading(async () => {
    const { error } = await supabase.from("codes").delete().eq("id", id);
    if (!error) setData((prev) => ({ ...prev, codes: prev.codes.filter((c) => c.id !== id) }));
  });

  const deleteCodes = (ids) => withLoading(async () => {
    const { error } = await supabase.from("codes").delete().in("id", ids);
    if (!error) setData((prev) => ({ ...prev, codes: prev.codes.filter((c) => !ids.includes(c.id)) }));
  });

  // --- Code Verification & Activation ---
  const verifyAndUseCode = async (codeString, userId) => {
    try {
      const cleanCode = (codeString || "").trim();
      if (!cleanCode) {
        return { success: false, message: "يرجى إدخال الكود" };
      }
      if (!userId) {
        return { success: false, message: "يجب تسجيل الدخول أولاً لتفعيل الكود" };
      }

      // Query Supabase directly for real-time accurate verification
      let { data: codeRecord, error: codeErr } = await supabase
        .from("codes")
        .select("*")
        .eq("code", cleanCode)
        .eq("active", true)
        .maybeSingle();

      // If not found with exact match, try case-insensitive
      if (!codeRecord && !codeErr) {
        const { data: ciRecord } = await supabase
          .from("codes")
          .select("*")
          .ilike("code", cleanCode)
          .eq("active", true)
          .maybeSingle();
        if (ciRecord) codeRecord = ciRecord;
      }

      if (codeErr || !codeRecord) {
        return { success: false, message: "الكود غير صحيح أو غير مفعل" };
      }

      if (codeRecord.used_count >= codeRecord.max_uses) {
        return { success: false, message: "هذا الكود استنفد عدد مرات الاستخدام المسموحة" };
      }

      // Check if user already has this chapter unlocked
      const { data: alreadyUnlocked } = await supabase
        .from("unlocked_chapters")
        .select("id")
        .eq("user_id", userId)
        .eq("chapter_id", codeRecord.chapter_id)
        .maybeSingle();

      // Increment used count for the code
      const newUsedCount = (codeRecord.used_count || 0) + 1;
      const { error: updateCodeErr } = await supabase
        .from("codes")
        .update({ used_count: newUsedCount })
        .eq("id", codeRecord.id);

      if (updateCodeErr) {
        console.error("Error updating code count:", updateCodeErr);
      }

      if (alreadyUnlocked) {
        // Reset view counts for all lessons in this chapter
        const { data: chLessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("chapter_id", codeRecord.chapter_id);

        if (chLessons && chLessons.length > 0) {
          const lessonIds = chLessons.map((l) => l.id);
          for (const lId of lessonIds) {
            await supabase
              .from("view_counts")
              .update({ count: 0 })
              .eq("user_id", userId)
              .eq("lesson_id", lId);
          }
        }
      } else {
        // Unlock chapter for this user
        const { error: unlockErr } = await supabase
          .from("unlocked_chapters")
          .insert({ user_id: userId, chapter_id: codeRecord.chapter_id });

        if (unlockErr) {
          console.error("Error inserting unlocked_chapter:", unlockErr);
        }
      }

      // Refresh store state to update UI immediately
      await fetchData();

      return {
        success: true,
        message: alreadyUnlocked
          ? "تم تفعيل الكود بنجاح وتجديد عدد المشاهدات!"
          : "تم تفعيل الكود وفتح الباب بنجاح!",
      };
    } catch (err) {
      console.error("Code verification error:", err?.message || err);
      return { success: false, message: "حدث خطأ أثناء التحقق من الكود، يرجى المحاولة مرة أخرى." };
    }
  };

  // --- Lesson Reorder ---
  // Updates sort_order for a list of lessons after drag-and-drop reordering
  const reorderLessons = async (reorderedLessons) => {
    // Optimistically update local state immediately
    setData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l) => {
        const updated = reorderedLessons.find((r) => r.id === l.id);
        return updated ? { ...l, sortOrder: updated.sortOrder } : l;
      }),
    }));
    // Persist each change to Supabase
    try {
      const updates = reorderedLessons.map((l) =>
        supabase.from("lessons").update({ sort_order: l.sortOrder }).eq("id", l.id)
      );
      await Promise.all(updates);
    } catch (err) {
      console.error("Reorder lessons error:", err);
    }
  };

  const incrementLessonView = async (userId, lessonId) => {
    if (!userId || !lessonId) return;
    
    // optimistically update local state
    setData((prev) => {
        const currentViewCounts = prev.viewCounts || [];
        const existingCountIndex = currentViewCounts.findIndex(v => v.userId === userId && v.lessonId === lessonId);
        let newViewCounts = [...currentViewCounts];
        if (existingCountIndex > -1) {
            newViewCounts[existingCountIndex] = { ...newViewCounts[existingCountIndex], count: newViewCounts[existingCountIndex].count + 1 };
        } else {
            newViewCounts.push({ userId, lessonId, count: 1 });
        }
        return {
            ...prev,
            viewCounts: newViewCounts,
        };
    });

    const existing = data.viewCounts.find(v => v.userId === userId && v.lessonId === lessonId);
    if (existing) {
       await supabase.from("view_counts").update({ count: existing.count + 1 }).eq("id", existing.id);
    } else {
       await supabase.from("view_counts").insert(toSnake({ userId, lessonId, count: 1 }));
       await supabase.from("lesson_views").insert(toSnake({ userId, lessonId }));
    }
  };

  const deleteUser = (id) => withLoading(async () => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  });

  // --- Notifications ---
  const addNotification = (notif) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("notifications").insert(toSnake(notif)).select().single();
    if (!error && inserted) setData((p) => ({ ...p, notifications: [toCamel(inserted), ...p.notifications] }));
  });

  const deleteNotification = (id) => withLoading(async () => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (!error) setData((p) => ({ ...p, notifications: p.notifications.filter((n) => n.id !== id) }));
  });

  const dismissNotification = (userId, notificationId) => withLoading(async () => {
    const { data: inserted, error } = await supabase.from("dismissed_notifications").insert(toSnake({ userId, notificationId })).select().single();
    if (!error && inserted) {
      setData((p) => ({ ...p, dismissedNotifications: [...p.dismissedNotifications, toCamel(inserted)] }));
    }
  });

  const updateUser = (id, updates) => withLoading(async () => {
    const { error } = await supabase.from("users").update(toSnake(updates)).eq("id", id);
    if (!error) {
      setData((prev) => {
        const updatedUsers = prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u));
        const updatedCurrentUser = prev.currentUser && prev.currentUser.id === id ? { ...prev.currentUser, ...updates } : prev.currentUser;
        return { ...prev, users: updatedUsers, currentUser: updatedCurrentUser };
      });
    }
  });

  const loginParent = async (parentPhone, studentPhone) => {
    const student = data.users.find(u => u.phone === studentPhone && u.parentPhone === parentPhone);
    if (!student) return { success: false, message: "بيانات الدخول غير صحيحة أو الطالب غير مسجل برقم هاتف ولي الأمر هذا." };
    
    const parentSession = { parentPhone };
    localStorage.setItem("fahemCurrentParent", JSON.stringify(parentSession));
    setData(prev => ({ ...prev, currentParent: parentSession }));
    return { success: true };
  };

  const logoutParent = () => {
    localStorage.removeItem("fahemCurrentParent");
    setData(prev => ({ ...prev, currentParent: null }));
  };

  return (
    <GlobalContext.Provider
      value={{
        ...data,
        isLoaded,
        isSubmitting,
        registerUser,
        loginUser,
        logoutUser,
        adminAddUser,
        loginParent,
        logoutParent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addCategory,
        updateCategory,
        deleteCategory,
        addClass,
        updateClass,
        deleteClass,
        addCourse,
        updateCourse,
        deleteCourse,
        addChapter,
        updateChapter,
        deleteChapter,
        addLesson,
        updateLesson,
        deleteLesson,
        reorderLessons,
        generateCodes,
        deleteCode,
        deleteCodes,
        verifyAndUseCode,
        incrementLessonView,
        deleteUser,
        updateUser,
        addNotification,
        deleteNotification,
        dismissNotification,
      }}
    >
      {isSubmitting && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", direction: "rtl" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "20px 40px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "30px", height: "30px", border: "4px solid #f3f3f3", borderTop: "4px solid #ef4444", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>جاري تحديث البيانات...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalStore = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalStore must be used within a GlobalProvider");
  return context;
};
