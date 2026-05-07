import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { useGetChild, useGetTasks, useGetProgress, GetTasksRoutineType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { clsx } from "clsx";

const getDateString = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const getDayLabel = (offset: number, lang: string): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const days = {
    ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
    fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  };
  const dayNames = days[lang as keyof typeof days] || days.en;
  return dayNames[d.getDay()];
};

const getDayNumber = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return String(d.getDate());
};

/** Fetch progress for a single day – wrapped as a hook component */
function DayColumn({ childId, offset, tasks, lang, getAuthHeaders }: {
  childId: number;
  offset: number;
  tasks: any[];
  lang: string;
  getAuthHeaders: () => any;
}) {
  const date = getDateString(offset);
  const { data: progress } = useGetProgress(childId, { date }, { request: getAuthHeaders() });
  const isToday = offset === 0;

  // Fetch adhkar completion for this specific date
  const [adhkar, setAdhkar] = useState<{ morningDoneToday: boolean; eveningDoneToday: boolean } | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    fetch(`/api/children/${childId}/adhkar?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(data => { if (data) setAdhkar(data); }).catch(() => {});
  }, [childId, date]);

  const allCompletions = [
    ...(progress?.morningCompletions || []),
    ...(progress?.eveningCompletions || []),
  ];
  const completedIds = new Set(allCompletions.filter(c => c.completed).map(c => c.taskId));
  const completedCount = completedIds.size;
  const totalCount = tasks.filter(t => t.isActive).length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const morningTasks = tasks.filter(t => t.routineType === 'morning' && t.isActive);
  const eveningTasks = tasks.filter(t => t.routineType === 'evening' && t.isActive);

  return (
    <div className={clsx(
      "flex-1 min-w-[120px] rounded-2xl p-3 flex flex-col gap-2 border-2 transition-all",
      isToday
        ? "border-yellow-400 bg-yellow-50 shadow-md"
        : "border-slate-200 bg-white"
    )}>
      {/* Day header */}
      <div className="text-center mb-1">
        <div className={clsx("text-xs font-bold uppercase tracking-wide", isToday ? "text-yellow-600" : "text-slate-400")}>
          {getDayLabel(offset, lang)}
        </div>
        <div className={clsx("text-2xl font-bold", isToday ? "text-yellow-700" : "text-slate-700")}>
          {getDayNumber(offset)}
        </div>
        {isToday && <div className="text-[10px] bg-yellow-400 text-yellow-900 rounded-full px-2 font-bold">TODAY</div>}
      </div>

      {/* Progress circle */}
      <div className="flex justify-center my-1">
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={pct === 100 ? "#22c55e" : isToday ? "#f59e0b" : "#94a3b8"}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{pct}%</span>
        </div>
      </div>

      {/* Morning tasks */}
      {morningTasks.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-400 mb-1">☀️</div>
          <div className="space-y-1">
            {morningTasks.map(task => {
              const done = completedIds.has(task.id);
              return (
                <div key={task.id} className={clsx(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-lg",
                  done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                )}>
                  <span>{task.emoji}</span>
                  <span className={clsx("truncate", done && "line-through opacity-70")}>
                    {lang === 'ar' ? task.titleAr : lang === 'fr' ? task.titleFr : task.title}
                  </span>
                  {done && <span className="ml-auto">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evening tasks */}
      {eveningTasks.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-400 mb-1">🌙</div>
          <div className="space-y-1">
            {eveningTasks.map(task => {
              const done = completedIds.has(task.id);
              return (
                <div key={task.id} className={clsx(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-lg",
                  done ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                )}>
                  <span>{task.emoji}</span>
                  <span className={clsx("truncate", done && "line-through opacity-70")}>
                    {lang === 'ar' ? task.titleAr : lang === 'fr' ? task.titleFr : task.title}
                  </span>
                  {done && <span className="ml-auto">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Adhkar section */}
      {adhkar && (
        <div className="mt-1 border-t border-slate-100 pt-2">
          <div className="text-[10px] font-bold text-slate-400 mb-1">
            {lang === 'ar' ? '📿 أذكار' : lang === 'fr' ? '📿 Adhkar' : '📿 Adhkar'}
          </div>
          <div className="space-y-1">
            <div className={clsx(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-lg",
              adhkar.morningDoneToday ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
            )}>
              <span>☀️</span>
              <span className={clsx("truncate", adhkar.morningDoneToday && "line-through opacity-70")}>
                {lang === 'ar' ? 'أذكار الصباح' : lang === 'fr' ? 'Adhkar matin' : 'Morning Adhkar'}
              </span>
              {adhkar.morningDoneToday && <span className="ml-auto">✓</span>}
            </div>
            <div className={clsx(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-lg",
              adhkar.eveningDoneToday ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
            )}>
              <span>🌙</span>
              <span className={clsx("truncate", adhkar.eveningDoneToday && "line-through opacity-70")}>
                {lang === 'ar' ? 'أذكار المساء' : lang === 'fr' ? 'Adhkar soir' : 'Evening Adhkar'}
              </span>
              {adhkar.eveningDoneToday && <span className="ml-auto">✓</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeeklyView() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: child } = useGetChild(childId, { request: getAuthHeaders() });
  const { data: morningTasks = [] } = useGetTasks(childId, { routineType: GetTasksRoutineType.morning }, { request: getAuthHeaders() });
  const { data: eveningTasks = [] } = useGetTasks(childId, { routineType: GetTasksRoutineType.evening }, { request: getAuthHeaders() });
  const allTasks = [...morningTasks, ...eveningTasks];

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [authLoading, user, setLocation]);

  if (authLoading || !user) return null;

  // Show Mon-Sun for this week (past 3 days + today + next 3 days)
  const offsets = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center gap-4">
        <Button variant="ghost" onClick={() => setLocation(`/child/${childId}`)} className="rounded-full">
          <ArrowLeft className="w-5 h-5 me-2" />
          {t('back')}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{child?.avatar}</span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{child?.name}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {lang === 'ar' ? 'الجدول الأسبوعي' : lang === 'fr' ? 'Planning Hebdomadaire' : 'Weekly Schedule'}</p>
          </div>
        </div>
        <div className="ml-auto bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1">
          ⭐ {child?.totalStars || 0}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold text-slate-700 mb-6 text-center">
          {lang === 'ar' ? '📅 الأسبوع الحالي' : lang === 'fr' ? '📅 Semaine en cours' : '📅 This Week'}
        </h2>

        {/* Weekly grid – horizontal scroll on small screens */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {offsets.map(offset => (
              <DayColumn
                key={offset}
                childId={childId}
                offset={offset}
                tasks={allTasks}
                lang={lang}
                getAuthHeaders={getAuthHeaders}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-400 rounded-full inline-block" /> {lang === 'ar' ? 'مكتملة' : lang === 'fr' ? 'Complété' : 'Completed'}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-300 rounded-full inline-block" /> {lang === 'ar' ? 'غير مكتملة' : lang === 'fr' ? 'Non complété' : 'Not done'}</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-400 rounded-full inline-block" /> {lang === 'ar' ? 'اليوم' : lang === 'fr' ? "Aujourd'hui" : 'Today'}</div>
        </div>
      </main>
    </div>
  );
}
