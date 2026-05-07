import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import {
  useGetChildren, useCreateChild, useGetProgress, useGetTasks,
  ChildGender, GetTasksRoutineType
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Plus, Settings, User, Star, Trophy, ChevronRight, Gamepad2, CalendarDays, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplay, AvatarPicker } from "@/components/AvatarDisplay";

const getLocalYYYYMMDD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const ACCENTS = [
  '#f59e0b','#8b5cf6','#06b6d4','#10b981','#f43f5e','#a855f7',
];

function ChildProgressRow({ child, idx, onNavigate, getAuthHeaders, lang }: {
  child: any; idx: number; onNavigate: (path: string) => void; getAuthHeaders: () => any; lang: string;
}) {
  const today = getLocalYYYYMMDD();
  const { data: progress } = useGetProgress(child.id, { date: today }, { request: getAuthHeaders() });
  const { data: morningTasks = [] } = useGetTasks(child.id, { routineType: GetTasksRoutineType.morning }, { request: getAuthHeaders() });
  const { data: eveningTasks = [] } = useGetTasks(child.id, { routineType: GetTasksRoutineType.evening }, { request: getAuthHeaders() });

  const morningDone = morningTasks.filter(t => progress?.morningCompletions?.some(c => c.taskId === t.id && c.completed)).length;
  const eveningDone = eveningTasks.filter(t => progress?.eveningCompletions?.some(c => c.taskId === t.id && c.completed)).length;
  const mTotal = morningTasks.length;
  const eTotal = eveningTasks.length;
  const allDone = (morningDone === mTotal && mTotal > 0) && (eveningDone === eTotal && eTotal > 0);

  const accent = ACCENTS[idx % ACCENTS.length];

  const L = {
    ar: { morning: 'صباح', evening: 'مساء', start: 'ابدأ', done: 'تم ✅', allDone: 'أنجز الكل! 🎉' },
    fr: { morning: 'Matin', evening: 'Soir', start: 'Commencer', done: 'Fait ✅', allDone: 'Tout fait ! 🎉' },
    en: { morning: 'Morning', evening: 'Evening', start: 'Start', done: 'Done ✅', allDone: 'All done! 🎉' },
  }[lang as 'ar' | 'fr' | 'en'] ?? { morning: 'Morning', evening: 'Evening', start: 'Start', done: 'Done ✅', allDone: 'All done!' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, type: 'spring', stiffness: 200 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Left accent stripe */}
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ background: accent }} />
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="cursor-pointer flex-shrink-0"
              onClick={() => onNavigate(`/child/${child.id}`)}
            >
              <AvatarDisplay avatar={child.avatar} name={child.name} size={52} />
            </div>

            {/* Name + badges */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onNavigate(`/child/${child.id}`)}
            >
              <p className="font-bold text-slate-800 text-base leading-tight truncate">{child.name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                  ⭐ {child.totalStars || 0}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                  🏆 Lvl {child.level || 1}
                </span>
                {allDone && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{L.allDone}</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={e => { e.stopPropagation(); onNavigate(`/child/${child.id}/edit`); }}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate(`/child/${child.id}`)}
                className="text-sm font-bold text-white px-4 py-2 rounded-xl shadow-sm transition-all"
                style={{ background: accent }}
              >
                {lang === 'ar' ? 'افتح' : lang === 'fr' ? 'Ouvrir' : 'Open'}
              </motion.button>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div
              className="cursor-pointer rounded-xl p-2.5 hover:opacity-90 transition-opacity"
              style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}
              onClick={() => onNavigate(`/child/${child.id}/routine?type=morning`)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: accent }}>☀️ {L.morning}</span>
                <span className="text-xs font-bold text-slate-500">{morningDone}/{mTotal}</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-white">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: accent }}
                  initial={{ width: 0 }}
                  animate={{ width: mTotal > 0 ? `${(morningDone / mTotal) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                />
              </div>
            </div>
            <div
              className="cursor-pointer rounded-xl p-2.5 hover:opacity-90 transition-opacity"
              style={{ background: '#4f46e512', border: '1px solid #4f46e530' }}
              onClick={() => onNavigate(`/child/${child.id}/routine?type=evening`)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-600">🌙 {L.evening}</span>
                <span className="text-xs font-bold text-slate-500">{eveningDone}/{eTotal}</span>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-white">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: eTotal > 0 ? `${(eveningDone / eTotal) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, delay: idx * 0.1 + 0.1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout, getAuthHeaders, isLoading: authLoading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const LANGS: Array<{ code: 'ar'|'en'|'fr'; label: string; name: string; flag: string }> = [
    { code: 'ar', label: 'Ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'En', name: 'English',  flag: '🇬🇧' },
    { code: 'fr', label: 'Fr', name: 'Français', flag: '🇫🇷' },
  ];
  const currentLangLabel = LANGS.find(l => l.code === lang)?.label ?? lang.toUpperCase();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("5");
  const [newGender, setNewGender] = useState<ChildGender>(ChildGender.boy);
  const [newAvatar, setNewAvatar] = useState('boy1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCancelConfirm, setSettingsCancelConfirm] = useState(false);

  const { status: subStatus, openPortal, startCheckout } = useSubscription();

  const { data: children = [], isLoading } = useGetChildren({ request: getAuthHeaders(), query: { enabled: !!user } });
  const createChildMutation = useCreateChild({ request: getAuthHeaders() });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [authLoading, user, setLocation]);

  if (authLoading || !user) return null;

  const handleLogout = () => { logout(); setLocation("/login"); };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    createChildMutation.mutate({
      data: { name: newName, age: parseInt(newAge), gender: newGender, avatar: newAvatar },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/children"] });
        setIsAddOpen(false);
        setNewName("");
        toast({ title: t('defaultTasksAdded') });
      },
      onError: () => toast({ variant: "destructive", title: "فشل إضافة الطفل" }),
    });
  };

  const L = {
    ar: { children: 'أطفالي', addChild: 'إضافة طفل', noChildren: 'أضف طفلك الأول', games: 'الألعاب التعليمية', gamesDesc: 'ذاكرة · حساب · ألوان — العب وتعلّم!', gamesBtn: 'العب الآن', account: 'الحساب', logout: 'خروج', today: 'اليوم', weekly: 'أسبوعي', welcome: 'أهلاً', totalStars: 'مجموع النجوم', children_lbl: 'الأطفال' },
    fr: { children: 'Mes enfants', addChild: 'Ajouter', noChildren: 'Ajoutez votre premier enfant', games: 'Jeux Éducatifs', gamesDesc: 'Mémoire · Maths · Couleurs — joue et apprends !', gamesBtn: 'Jouer', account: 'Compte', logout: 'Déconnexion', today: "Aujourd'hui", weekly: 'Semaine', welcome: 'Bonjour', totalStars: 'Total étoiles', children_lbl: 'Enfants' },
    en: { children: 'My Children', addChild: 'Add Child', noChildren: 'Add your first child', games: 'Educational Games', gamesDesc: 'Memory · Math · Colors — play and learn!', gamesBtn: 'Play Now', account: 'Account', logout: 'Log Out', today: 'Today', weekly: 'Weekly', welcome: 'Hello', totalStars: 'Total Stars', children_lbl: 'Children' },
  }[lang as 'ar' | 'fr' | 'en'] ?? { children: 'Children', addChild: 'Add', noChildren: 'Add first child', games: 'Games', gamesDesc: 'Play and learn!', gamesBtn: 'Play', account: 'Account', logout: 'Logout', today: 'Today', weekly: 'Weekly', welcome: 'Hello', totalStars: 'Stars', children_lbl: 'Children' };

  const totalStars = children.reduce((sum, c) => sum + (c.totalStars || 0), 0);
  const firstChildId = children[0]?.id;

  return (
    <div className="min-h-screen bg-slate-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ─── Top Nav ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Routini" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg text-violet-700 hidden sm:block">روتيني</span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 ms-2 overflow-x-auto flex-1">
            <NavTab active icon="🏠" label={L.today} />
            {firstChildId && (
              <NavTab onClick={() => setLocation(`/child/${firstChildId}/weekly`)} icon="📅" label={L.weekly} />
            )}
            {firstChildId && (
              <NavTab onClick={() => setLocation(`/child/${firstChildId}/games`)} icon="🎮" label={L.games} />
            )}
          </nav>

          {/* Right: language circle + user avatar */}
          <div className="flex items-center gap-2 flex-shrink-0 ms-auto">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(v => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors select-none"
              >
                {currentLangLabel}
              </button>
              {langMenuOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                  <div className="absolute top-11 end-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-w-[120px]"
                    style={{ direction: 'ltr' }}>
                    {LANGS.map(({ code, name, flag }) => (
                      <button key={code}
                        onClick={() => { setLang(code); setLangMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-violet-50 ${lang === code ? 'text-violet-700 bg-violet-50' : 'text-slate-600'}`}
                      >
                        <span className="text-lg shrink-0">{flag}</span>
                        <span>{name}</span>
                        {lang === code && <span className="ms-auto text-violet-500">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold px-3 py-1.5 rounded-full transition-colors text-sm border border-violet-100"
            >
              <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${sidebarOpen ? 'rotate-90' : ''}`} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100 transition-colors"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>


      {/* ─── Trial / Subscription Banner ─────────────────────── */}
      {subStatus && subStatus.trialActive && !subStatus.subscriptionActive && (
        <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span className="text-white text-sm font-bold">
              🎁 {lang === 'ar'
                ? `تجربة مجانية · ${subStatus.trialDaysLeft} ${subStatus.trialDaysLeft === 1 ? 'يوم' : 'أيام'} متبقية`
                : lang === 'fr'
                ? `Essai gratuit · ${subStatus.trialDaysLeft} jours restants`
                : `Free trial · ${subStatus.trialDaysLeft} day${subStatus.trialDaysLeft === 1 ? '' : 's'} left`}
            </span>
            <button
              onClick={() => setLocation("/subscription")}
              className="text-xs font-black bg-white text-violet-700 px-3 py-1 rounded-full hover:bg-white/90 transition-colors flex-shrink-0"
            >
              {lang === 'ar' ? 'اشترك الآن' : lang === 'fr' ? 'S\'abonner' : 'Subscribe'}
            </button>
          </div>
        </div>
      )}
      {subStatus && !subStatus.trialActive && !subStatus.subscriptionActive && (
        <div className="bg-red-500 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span className="text-white text-sm font-bold">
              ⏰ {lang === 'ar' ? 'انتهت الفترة التجريبية' : lang === 'fr' ? 'Essai terminé' : 'Trial expired'}
            </span>
            <button
              onClick={() => setLocation("/subscription")}
              className="text-xs font-black bg-white text-red-600 px-3 py-1 rounded-full hover:bg-white/90 transition-colors flex-shrink-0"
            >
              {lang === 'ar' ? 'اشترك الآن' : lang === 'fr' ? 'S\'abonner' : 'Subscribe now'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Body ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

        {/* ─── Main column ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Section: Children */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>👨‍👩‍👧‍👦</span> {L.children}
                <span className="text-xs font-normal bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full ms-1">
                  {children.length}
                </span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {L.addChild}
              </motion.button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-28 animate-pulse bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : children.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-white"
              >
                <div className="text-5xl mb-3">🧸</div>
                <p className="text-slate-500 font-bold text-base">{L.noChildren}</p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="mt-4 text-sm font-bold text-violet-500 underline"
                >
                  + {L.addChild}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {children.map((child, idx) => (
                  <ChildProgressRow
                    key={child.id}
                    child={child}
                    idx={idx}
                    onNavigate={setLocation}
                    getAuthHeaders={getAuthHeaders}
                    lang={lang}
                  />
                ))}
              </div>
            )}
          </section>

        </div>

        {/* ─── Right sidebar (desktop) ──────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
          {/* User card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-violet-700 text-lg shadow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{user.name}</p>
                <p className="text-white/70 text-xs truncate">{user.email}</p>
              </div>
            </div>
            <div className="p-3 space-y-1">
              <SidebarItem icon={<Star className="w-4 h-4 text-amber-500" />} label={`${L.totalStars}: ${totalStars} ⭐`} />
              <SidebarItem icon={<User className="w-4 h-4 text-violet-500" />} label={`${L.children_lbl}: ${children.length}`} />
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {L.logout}
                </button>
              </div>
            </div>
          </div>

          {/* Children quick list */}
          {children.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide px-2 mb-2">{L.children_lbl}</p>
              <div className="space-y-1">
                {children.map((child, i) => (
                  <button
                    key={child.id}
                    onClick={() => setLocation(`/child/${child.id}`)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-violet-50 transition-colors text-start group"
                  >
                    <AvatarDisplay avatar={child.avatar} name={child.name} size={34} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-700 truncate group-hover:text-violet-700">{child.name}</p>
                      <p className="text-xs text-slate-400">⭐ {child.totalStars || 0} · Lvl {child.level || 1}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-400" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-violet-500 hover:bg-violet-50 transition-colors border border-dashed border-violet-200"
              >
                <Plus className="w-4 h-4" />
                {L.addChild}
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* ─── Mobile user dropdown ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-16 end-4 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-3">
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-white/70 text-xs">{user.email}</p>
              </div>
              <div className="p-2 space-y-0.5">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => { setLocation(`/child/${child.id}`); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 transition-colors text-start"
                  >
                    <AvatarDisplay avatar={child.avatar} name={child.name} size={30} />
                    <span className="font-bold text-sm text-slate-700">{child.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 ms-auto" />
                  </button>
                ))}
                <button
                  onClick={() => { setIsAddOpen(true); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {L.addChild}
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> {L.logout}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Settings Panel ──────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowSettings(false); setSettingsCancelConfirm(false); }}
            />
            <motion.div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 end-0 h-full z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-8 flex-shrink-0">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-black text-xl">
                    {lang === 'ar' ? 'الإعدادات' : lang === 'fr' ? 'Paramètres' : 'Settings'}
                  </h2>
                  <button
                    onClick={() => { setShowSettings(false); setSettingsCancelConfirm(false); }}
                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Avatar + info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-3xl text-white shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-tight">{user.name}</p>
                    <p className="text-white/70 text-sm mt-0.5">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-5 py-6 space-y-5">

                {/* Personal Info card */}
                <section className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-500" />
                    <span className="font-bold text-slate-700 text-sm">
                      {lang === 'ar' ? 'المعلومات الشخصية' : lang === 'fr' ? 'Informations personnelles' : 'Personal Info'}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{lang === 'ar' ? 'الاسم' : lang === 'fr' ? 'Nom' : 'Name'}</span>
                      <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                      <span className="font-bold text-slate-800 text-sm truncate max-w-[160px]">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{lang === 'ar' ? 'عدد الأطفال' : lang === 'fr' ? 'Enfants' : 'Children'}</span>
                      <span className="font-bold text-slate-800 text-sm">{children.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{lang === 'ar' ? 'مجموع النجوم' : lang === 'fr' ? 'Étoiles' : 'Total Stars'}</span>
                      <span className="font-bold text-amber-500 text-sm">⭐ {children.reduce((s, c) => s + (c.totalStars || 0), 0)}</span>
                    </div>
                  </div>
                </section>

                {/* Subscription card */}
                <section className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <span className="text-violet-500">⭐</span>
                    <span className="font-bold text-slate-700 text-sm">
                      {lang === 'ar' ? 'الاشتراك' : lang === 'fr' ? 'Abonnement' : 'Subscription'}
                    </span>
                    {subStatus?.subscriptionActive && (
                      <span className="ms-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {lang === 'ar' ? 'فعّال' : lang === 'fr' ? 'Actif' : 'Active'}
                      </span>
                    )}
                    {subStatus?.trialActive && !subStatus.subscriptionActive && (
                      <span className="ms-auto text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {lang === 'ar' ? `تجربة · ${subStatus.trialDaysLeft}ي` : `Trial · ${subStatus.trialDaysLeft}d`}
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {subStatus?.subscriptionActive ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-sm">{lang === 'ar' ? 'الخطة' : 'Plan'}</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {subStatus.plan === 'yearly' ? (lang === 'ar' ? 'سنوي €100' : '€100/year') : (lang === 'ar' ? 'شهري €9.99' : '€9.99/month')}
                          </span>
                        </div>
                        {subStatus.currentPeriodEnd && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-sm">{lang === 'ar' ? 'يجدد في' : 'Renews'}</span>
                            <span className="font-bold text-slate-800 text-sm">
                              {new Date(subStatus.currentPeriodEnd).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => openPortal().catch(() => {})}
                          className="w-full mt-1 text-center text-xs font-bold text-violet-600 hover:text-violet-800 underline"
                        >
                          {lang === 'ar' ? 'إدارة الاشتراك والفواتير ↗' : lang === 'fr' ? 'Gérer l\'abonnement ↗' : 'Manage billing ↗'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setShowSettings(false); setLocation("/subscription"); }}
                        className="w-full text-center text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 py-2.5 rounded-xl transition-colors"
                      >
                        {lang === 'ar' ? '🚀 اشترك في روتيني بريميوم' : lang === 'fr' ? '🚀 S\'abonner à Routini' : '🚀 Subscribe to Routini Premium'}
                      </button>
                    )}
                  </div>
                </section>

                {/* Logout */}
                <button
                  onClick={() => { handleLogout(); setShowSettings(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Déconnexion' : 'Log Out'}
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Add Child Dialog ─────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-0 p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-center text-violet-700">
              ✨ {t('addChild')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddChild} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-violet-700">{t('childName')}</Label>
              <Input
                required value={newName} onChange={e => setNewName(e.target.value)}
                placeholder={lang === 'ar' ? 'اسم الطفل' : lang === 'fr' ? "Prénom de l'enfant" : "Child's name"}
                className="rounded-2xl py-5 text-base border-2 border-violet-100 focus-visible:ring-violet-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-violet-700">{t('age')}</Label>
              <Input
                type="number" min="1" max="12" required
                value={newAge} onChange={e => setNewAge(e.target.value)}
                className="rounded-2xl py-5 text-base border-2 border-violet-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-violet-700">{t('selectAvatar')}</Label>
              <AvatarPicker value={newAvatar} onChange={setNewAvatar} defaultTab="animals" />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button" onClick={() => setIsAddOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 border-2 border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit" disabled={createChildMutation.isPending}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-violet-500 hover:bg-violet-600 transition-colors disabled:opacity-60 shadow-md"
              >
                {createChildMutation.isPending ? "..." : `✅ ${t('create')}`}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NavTab({ label, icon, active, onClick }: { label: string; icon: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
        active
          ? 'text-violet-700 bg-violet-50 border-b-2 border-violet-500'
          : 'text-slate-500 hover:text-violet-600 hover:bg-slate-50'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600">
      {icon}
      <span>{label}</span>
    </div>
  );
}
