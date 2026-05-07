import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { clsx } from "clsx";
import { Task } from "@workspace/api-client-react";

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: number, completed: boolean) => void;
  lang: string;
  isEvening?: boolean;
}

export function TaskCard({ task, isCompleted, onToggle, lang }: TaskCardProps) {
  const title = lang === 'ar' ? task.titleAr : lang === 'fr' ? task.titleFr : task.title;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onToggle(task.id, !isCompleted)}
      className={clsx(
        "relative overflow-hidden rounded-3xl border-4 cursor-pointer p-4 flex flex-col items-center justify-center gap-2 text-center h-[160px] transition-colors duration-300",
        isCompleted 
          ? "bg-green-100 border-green-400 text-green-900 shadow-[0_6px_0_0_rgba(74,222,128,0.4)]" 
          : "bg-white border-white text-slate-800 shadow-[0_6px_0_0_rgba(0,0,0,0.1)]"
      )}
    >
      <div className={clsx(
        "text-5xl transition-transform duration-500",
        isCompleted ? "scale-110" : "scale-100"
      )}>
        {task.emoji}
      </div>
      
      <h3 className="text-lg font-display leading-tight font-bold">{title}</h3>
      
      {task.scheduledTime && (
        <span className="bg-black/5 px-2 py-0.5 rounded-full text-xs font-bold opacity-70">
          🕒 {task.scheduledTime}
        </span>
      )}
      
      <div className={clsx(
        "absolute top-3 end-3 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300",
        isCompleted 
          ? "bg-green-500 border-green-500 text-white scale-100 rotate-0" 
          : "bg-slate-100 border-slate-200 text-transparent scale-90 -rotate-12"
      )}>
        <Check strokeWidth={4} className="w-6 h-6" />
      </div>
    </motion.div>
  );
}
