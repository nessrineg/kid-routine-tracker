import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { playSound } from "@/lib/audio";
import { 
  useGetChild, 
  useGetTasks, 
  useGetProgress, 
  useUpdateProgress, 
  useResetProgress,
  useCreateTask,
  useDeleteTask,
  GetTasksRoutineType,
  ResetProgressRequestRoutineType,
  CreateTaskRequestRoutineType
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RotateCcw, CalendarDays, Plus, Trash2 } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const getLocalYYYYMMDD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function ChildRoutine() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const urlType = new URLSearchParams(window.location.search).get('type') as 'morning' | 'evening' | null;
  const [pickedType, setPickedType] = useState<'morning' | 'evening' | null>(urlType);
  const routineType = pickedType === 'evening' ? GetTasksRoutineType.evening : GetTasksRoutineType.morning;

  const { toast } = useToast();
  const [showCelebration, setShowCelebration] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newEmoji, setNewEmoji] = useState("✨");
  const [newTitle, setNewTitle] = useState("");
  const [newTitleAr, setNewTitleAr] = useState("");
  const today = getLocalYYYYMMDD();

  const { data: child } = useGetChild(childId, { request: getAuthHeaders() });
  const { data: tasks = [] } = useGetTasks(childId, { routineType }, { request: getAuthHeaders() });
  const { data: progress } = useGetProgress(childId, { date: today }, { request: getAuthHeaders() });
  
  const updateProgressMutation = useUpdateProgress({ request: getAuthHeaders() });
  const resetProgressMutation = useResetProgress({ request: getAuthHeaders() });
  const createTaskMutation = useCreateTask({ request: getAuthHeaders() });
  const deleteTaskMutation = useDeleteTask({ request: getAuthHeaders() });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (routineType === 'evening') {
      document.documentElement.classList.add('evening-mode');
    } else {
      document.documentElement.classList.remove('evening-mode');
    }
    return () => document.documentElement.classList.remove('evening-mode');
  }, [routineType]);

  const completions = routineType === 'morning' ? progress?.morningCompletions : progress?.eveningCompletions;
  const completedCount = tasks.filter(t => completions?.some(c => c.taskId === t.id && c.completed)).length;
  const totalCount = tasks.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      playSound('celebrate');
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ff8800']
      });
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  if (authLoading || !user) return null;

  if (!pickedType) {
    const L2 = {
      ar: { title: 'الروتين', morning: 'روتين الصباح', evening: 'روتين المساء' },
      fr: { title: 'Routine', morning: 'Routine du matin', evening: 'Routine du soir' },
      en: { title: 'Routine', morning: 'Morning Routine', evening: 'Evening Routine' },
    }[lang as 'ar' | 'fr' | 'en'] ?? { title: 'Routine', morning: 'Morning', evening: 'Evening' };

    return (
      <div className="min-h-screen flex flex-col" dir="rtl"
        style={{ background: 'linear-gradient(180deg, #bfdbfe 0%, #e0f2fe 50%, #ddd6fe 100%)' }}>
        {['☀️','🌤️','🌙','⭐'].map((e, i) => (
          <motion.div key={i} className="fixed text-2xl pointer-events-none select-none"
            style={{ left:`${[5,75,15,85][i]}%`, top:`${[8,12,72,68][i]}%`, opacity:0.35 }}
            animate={{ y:[0,-12,0] }} transition={{ duration:3+i, repeat:Infinity, delay:i*0.5 }}
          >{e}</motion.div>
        ))}
        <header className="relative z-10 flex items-center justify-between mt-2 mb-5 mx-4 bg-white/20 backdrop-blur-md rounded-[2rem] p-3 shadow-sm border border-white/30">
          <motion.button whileTap={{ scale:0.9 }}
            onClick={() => setLocation(`/child/${childId}`)}
            className="flex items-center gap-1 rounded-full font-bold text-sky-950 hover:bg-white/40 px-3 py-2">
            <ArrowLeft className="w-5 h-5" />
            {lang === 'ar' ? 'رجوع' : lang === 'fr' ? 'Retour' : 'Back'}
          </motion.button>
          <h1 className="text-xl font-bold text-sky-950">{L2.title}</h1>
          <div className="w-10" />
        </header>
        <main className="relative z-10 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-5 py-8 gap-4">
          <div className="grid grid-cols-2 gap-4 w-full">
            {[
              { id:'morning', emoji:'☀️', label:L2.morning, bg:'linear-gradient(135deg,#fb923c,#f97316)', shadow:'#c2410c' },
              { id:'evening', emoji:'🌙', label:L2.evening, bg:'linear-gradient(135deg,#818cf8,#4f46e5)', shadow:'#3730a3' },
            ].map(opt => (
              <motion.button key={opt.id} whileHover={{ scale:1.04, y:-4 }} whileTap={{ scale:0.96 }}
                onClick={() => setPickedType(opt.id as 'morning' | 'evening')}
                className="rounded-[2rem] flex flex-col items-center justify-center gap-3 py-10 text-white shadow-xl"
                style={{ background:opt.bg, boxShadow:`0 8px 0 ${opt.shadow}` }}>
                <motion.div animate={{ rotate:[0,15,-15,0] }} transition={{ duration:3, repeat:Infinity }}
                  className="text-6xl">{opt.emoji}</motion.div>
                <span className="font-bold text-lg text-center px-2">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const handleToggleTask = (taskId: number, completed: boolean) => {
    if (completed) playSound('check');
    else playSound('pop');

    updateProgressMutation.mutate({
      childId,
      data: { taskId, completed, date: today }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/progress`] });
      }
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      childId,
      data: {
        title: newTitle || newTitleAr,
        titleAr: newTitleAr || newTitle,
        titleFr: newTitle || newTitleAr,
        emoji: newEmoji,
        routineType: routineType as unknown as CreateTaskRequestRoutineType,
        points: 10,
        order: tasks.length + 1,
      }
    }, {
      onSuccess: () => {
        setAddTaskOpen(false);
        setNewTitle(""); setNewTitleAr(""); setNewEmoji("✨");
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/tasks`] });
        toast({ title: lang === 'ar' ? 'تمت إضافة المهمة ✅' : 'Task added!' });
      }
    });
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate({ childId, taskId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/tasks`] });
      }
    });
  };

  const handleReset = () => {
    resetProgressMutation.mutate({
      childId,
      data: { routineType: routineType as unknown as ResetProgressRequestRoutineType, date: today }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/children/${childId}/progress`] });
      }
    });
  };

  const isEvening = routineType === 'evening';

  return (
    <div className={clsx(
      "min-h-screen w-full transition-colors duration-1000 relative overflow-x-hidden",
      isEvening ? "bg-indigo-950" : "bg-sky-200"
    )}>
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 opacity-60 pointer-events-none transition-opacity duration-1000">
        <img 
          src={`${import.meta.env.BASE_URL}images/${isEvening ? 'hero-evening' : 'hero-morning'}.png`} 
          className="w-full h-full object-cover" 
          alt="bg" 
        />
      </div>

      {/* Header — full-width like AdhkarPage */}
      <header className="relative z-10 flex items-center justify-between mt-2 mb-5 mx-4 bg-white/20 backdrop-blur-md rounded-[2rem] p-3 shadow-sm border border-white/30">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => urlType ? setLocation(`/child/${childId}`) : setPickedType(null)}
            className={clsx("rounded-full font-bold", isEvening ? "text-white hover:bg-white/10" : "text-sky-950 hover:bg-white/40")}
          >
            <ArrowLeft className="w-5 h-5 me-1" />
            {t('back')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setLocation(`/child/${childId}/weekly`)}
            className={clsx("rounded-full font-bold", isEvening ? "text-white hover:bg-white/10" : "text-sky-950 hover:bg-white/40")}
          >
            <CalendarDays className="w-5 h-5 me-1" />
            {lang === 'ar' ? 'أسبوعي' : lang === 'fr' ? 'Semaine' : 'Weekly'}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {child?.avatar && (
            <div className="border-2 border-white/50 shadow-md rounded-full">
              <AvatarDisplay avatar={child.avatar} name={child.name} size={38} />
            </div>
          )}
          <span className={clsx("text-xl font-display font-bold hidden sm:block", isEvening ? "text-white" : "text-sky-950")}>
            {child?.name}
          </span>
        </div>
        <div className="bg-yellow-400 text-yellow-950 px-3 py-1.5 rounded-full font-bold text-base shadow-inner flex items-center gap-2 border-2 border-yellow-300">
          ⭐ <span>{progress?.starsEarned || 0}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-24">

        {/* Toggle Switch */}
        <div className="flex bg-black/10 backdrop-blur-md rounded-full p-1.5 max-w-sm mx-auto shadow-inner mb-6">
          <button 
            className={clsx(
              "flex-1 py-2.5 rounded-full text-lg font-bold transition-all duration-300", 
              !isEvening ? 'bg-white text-yellow-500 shadow-md transform scale-105' : 'text-white/70 hover:text-white'
            )} 
            onClick={() => setPickedType('morning')}
          >
            ☀️ {t('morning')}
          </button>
          <button 
            className={clsx(
              "flex-1 py-2.5 rounded-full text-lg font-bold transition-all duration-300", 
              isEvening ? 'bg-indigo-800 text-purple-300 shadow-md transform scale-105 border border-indigo-600' : 'text-slate-700 hover:text-slate-900'
            )} 
            onClick={() => setPickedType('evening')}
          >
            🌙 {t('evening')}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1.5 px-2">
            <span className={clsx("font-bold text-base", isEvening ? "text-indigo-200" : "text-sky-800")}>
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full h-7 bg-black/20 rounded-full overflow-hidden border-4 border-white/40 shadow-inner relative">
            <div 
              className={clsx(
                "h-full transition-all duration-1000 ease-out relative overflow-hidden",
                isEvening ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-yellow-400 to-green-400"
              )}
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            >
               <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/30" />
            </div>
          </div>
        </div>


        {/* Task Grid */}
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-white/50">
            <h3 className={clsx("text-2xl font-bold", isEvening ? "text-indigo-100" : "text-sky-900")}>
              {lang === 'ar' ? 'لا توجد مهام بعد!' : lang === 'fr' ? 'Pas de tâches!' : 'No tasks yet!'}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tasks.map(task => {
              const isCompleted = completions?.some(c => c.taskId === task.id && c.completed) || false;
              return (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isCompleted={isCompleted} 
                  onToggle={handleToggleTask}
                  lang={lang}
                />
              );
            })}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="mt-7 flex items-center justify-center gap-4">
          <Button
            onClick={() => setAddTaskOpen(true)}
            className={clsx(
              "rounded-full px-7 py-5 text-base font-bold shadow-lg border-4",
              isEvening
                ? "bg-indigo-700 hover:bg-indigo-600 text-white border-indigo-500"
                : "bg-white hover:bg-yellow-50 text-sky-700 border-sky-200"
            )}
          >
            <Plus className="w-5 h-5 me-2" />
            {lang === 'ar' ? 'إضافة مهمة' : lang === 'fr' ? 'Ajouter une tâche' : 'Add Task'}
          </Button>

          {completedCount > 0 && (
            <Button 
              onClick={handleReset}
              disabled={resetProgressMutation.isPending}
              variant="outline" 
              className={clsx(
                "rounded-full px-7 py-5 text-base font-bold border-4 bg-transparent",
                isEvening ? "border-indigo-400 text-indigo-200 hover:bg-indigo-400/20" : "border-sky-400 text-sky-700 hover:bg-sky-400/20"
              )}
            >
              <RotateCcw className="w-5 h-5 me-2" />
              {t('reset')}
            </Button>
          )}
        </div>
      </div>

      {/* Celebration Overlay — centered star + message, no box */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          {/* Floating background sparkles */}
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-3xl pointer-events-none select-none"
              style={{
                left: `${8 + i * 9}%`,
                top: i % 2 === 0 ? `${15 + (i * 7) % 30}%` : `${55 + (i * 5) % 30}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], y: [0, -40, -80] }}
              transition={{ duration: 2, delay: i * 0.18, ease: 'easeOut' }}
            >
              {['⭐','🌟','✨','💫','🎉'][i % 5]}
            </motion.span>
          ))}

          {/* White box with star + message */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="bg-white rounded-[2.5rem] px-12 py-8 flex flex-col items-center shadow-2xl border-4 border-yellow-300"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="text-[80px] leading-none mb-3"
            >
              ⭐
            </motion.div>
            <h2 className="text-4xl font-display font-black text-yellow-500 mb-2 drop-shadow-sm">
              {t('amazing')}
            </h2>
            <p className="text-xl font-bold text-slate-600">
              {lang === 'ar' ? 'أنهيت جميع المهام! 🎉' : lang === 'fr' ? 'Toutes les tâches! 🎉' : 'All tasks done! 🎉'}
            </p>
          </motion.div>
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="rounded-[2rem] p-6 border-4 border-slate-200 max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl text-center font-bold text-slate-800">
              {lang === 'ar' ? '➕ مهمة جديدة' : lang === 'fr' ? 'Nouvelle tâche' : 'New Task'}
              <span className="ms-2 text-sm font-normal text-slate-500">
                {routineType === 'morning' ? '☀️' : '🌙'}
              </span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4 mt-2">
            <div className="flex gap-3">
              <div className="w-20">
                <Label className="text-xs font-bold text-slate-500 mb-1 block">رمز</Label>
                <Input
                  value={newEmoji}
                  onChange={e => setNewEmoji(e.target.value)}
                  className="text-center text-2xl h-12 rounded-xl"
                  required
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs font-bold text-slate-500 mb-1 block">
                  {lang === 'ar' ? 'اسم المهمة (عربي)' : 'Task name'}
                </Label>
                <Input
                  value={newTitleAr}
                  onChange={e => setNewTitleAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: تفريش الأسنان' : 'e.g. Brush teeth'}
                  className="rounded-xl h-12"
                  required
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 mb-1 block">
                {lang === 'ar' ? 'اسم المهمة (إنجليزي) — اختياري' : 'Task name (Arabic) — optional'}
              </Label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Brush teeth"
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddTaskOpen(false)} className="flex-1 rounded-full py-5">
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending || !newTitleAr}
                className={clsx(
                  "flex-1 rounded-full py-5 font-bold text-white",
                  isEvening ? "bg-indigo-600 hover:bg-indigo-700" : "bg-sky-500 hover:bg-sky-600"
                )}
              >
                {createTaskMutation.isPending ? '...' : (lang === 'ar' ? 'إضافة ✅' : 'Add')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
