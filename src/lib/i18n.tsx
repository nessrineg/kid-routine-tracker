import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar" | "fr";

export const translations = {
  en: {
    welcome: "Welcome to Routini!",
    login: "Log In",
    register: "Create Account",
    email: "Email Address",
    password: "Password",
    name: "Your Name",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    dashboard: "Parent Dashboard",
    addChild: "Add New Child",
    childName: "Child's Name",
    age: "Age",
    boy: "Boy",
    girl: "Girl",
    selectAvatar: "Choose an Avatar",
    create: "Create",
    cancel: "Cancel",
    morning: "Morning Routine",
    evening: "Evening Routine",
    stars: "Stars",
    points: "Points",
    reset: "Reset Tasks",
    manage: "Manage",
    addTask: "Add Task",
    delete: "Delete",
    edit: "Edit",
    emoji: "Emoji",
    taskEn: "Task Name (English)",
    taskAr: "Task Name (Arabic)",
    taskFr: "Task Name (French)",
    save: "Save Changes",
    back: "Go Back",
    logout: "Log Out",
    amazing: "AMAZING!",
    routineComplete: "You completed your routine!",
    confirmReset: "Are you sure you want to reset all tasks for today?",
    yes: "Yes, reset",
    no: "No, keep them",
    defaultTasksAdded: "Default tasks added!",
    myChildren: "My Children",
    goRoutine: "Let's Go! ▶️",
    noChildren: "No children added yet. Add your first child to get started!",
    saveSuccess: "Saved successfully!",
    deleteSuccess: "Deleted successfully!",
    order: "Order",
  },
  ar: {
    welcome: "مرحباً بك في روتيني!",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "اسمك",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    dashboard: "لوحة تحكم الأهل",
    addChild: "إضافة طفل جديد",
    childName: "اسم الطفل",
    age: "العمر",
    boy: "ولد",
    girl: "بنت",
    selectAvatar: "اختر صورة شخصية",
    create: "إنشاء",
    cancel: "إلغاء",
    morning: "روتين الصباح",
    evening: "روتين المساء",
    stars: "نجوم",
    points: "نقاط",
    reset: "إعادة تعيين المهام",
    manage: "إدارة",
    addTask: "إضافة مهمة",
    delete: "حذف",
    edit: "تعديل",
    emoji: "رمز تعبيري",
    taskEn: "اسم المهمة (إنجليزي)",
    taskAr: "اسم المهمة (عربي)",
    taskFr: "اسم المهمة (فرنسي)",
    save: "حفظ التغييرات",
    back: "العودة",
    logout: "تسجيل الخروج",
    amazing: "رائع!",
    routineComplete: "لقد أكملت روتينك بنجاح!",
    confirmReset: "هل أنت متأكد أنك تريد إعادة تعيين جميع المهام لليوم؟",
    yes: "نعم، إعادة تعيين",
    no: "لا، احتفظ بها",
    defaultTasksAdded: "تمت إضافة المهام الافتراضية!",
    myChildren: "أطفالي",
    goRoutine: "هيا نبدأ! ▶️",
    noChildren: "لم تتم إضافة أطفال بعد. أضف طفلك الأول للبدء!",
    saveSuccess: "تم الحفظ بنجاح!",
    deleteSuccess: "تم الحذف بنجاح!",
    order: "الترتيب",
  },
  fr: {
    welcome: "Bienvenue sur Routini!",
    login: "Connexion",
    register: "Créer un compte",
    email: "Adresse e-mail",
    password: "Mot de passe",
    name: "Votre nom",
    noAccount: "Vous n'avez pas de compte?",
    hasAccount: "Vous avez déjà un compte?",
    dashboard: "Tableau de bord Parent",
    addChild: "Ajouter un enfant",
    childName: "Nom de l'enfant",
    age: "Âge",
    boy: "Garçon",
    girl: "Fille",
    selectAvatar: "Choisir un Avatar",
    create: "Créer",
    cancel: "Annuler",
    morning: "Routine du Matin",
    evening: "Routine du Soir",
    stars: "Étoiles",
    points: "Points",
    reset: "Réinitialiser les tâches",
    manage: "Gérer",
    addTask: "Ajouter une tâche",
    delete: "Supprimer",
    edit: "Modifier",
    emoji: "Émoji",
    taskEn: "Nom de la tâche (Anglais)",
    taskAr: "Nom de la tâche (Arabe)",
    taskFr: "Nom de la tâche (Français)",
    save: "Enregistrer",
    back: "Retour",
    logout: "Déconnexion",
    amazing: "GÉNIAL!",
    routineComplete: "Tu as terminé ta routine!",
    confirmReset: "Es-tu sûr de vouloir réinitialiser toutes les tâches d'aujourd'hui?",
    yes: "Oui, réinitialiser",
    no: "Non, les garder",
    defaultTasksAdded: "Tâches par défaut ajoutées!",
    myChildren: "Mes Enfants",
    goRoutine: "C'est parti! ▶️",
    noChildren: "Aucun enfant ajouté. Ajoutez votre premier enfant pour commencer!",
    saveSuccess: "Enregistré avec succès!",
    deleteSuccess: "Supprimé avec succès!",
    order: "Ordre",
  }
};

interface LangContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(
    (localStorage.getItem("lang") as Language) || "en"
  );

  const setLang = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: keyof typeof translations.en) => {
    return translations[lang]?.[key] || translations["en"][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
