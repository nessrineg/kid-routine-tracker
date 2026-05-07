import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import {
  useGetChild,
  useGetProgress,
  useGetTasks,
  GetTasksRoutineType,
} from "@workspace/api-client-react";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarDisplay } from "@/components/AvatarDisplay";

interface AdhkarStats {
  morningDoneToday: boolean;
  eveningDoneToday: boolean;
  morningWeekCount: number;
  eveningWeekCount: number;
}

const getLocalYYYYMMDD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CARDS = [
  {
    id: 'routine',
    emoji: '📋',
    bg: 'linear-gradient(160deg,#34d399 0%,#10b981 55%,#059669 100%)',
    shadow: '#065f46',
    shine: '#a7f3d0',
    label: { ar: 'روتيني', fr: 'Routine', en: 'Routine' },
    deco: '🌞',
  },
  {
    id: 'adhkar',
    emoji: '🤲',
    bg: 'linear-gradient(160deg,#fbbf24 0%,#f59e0b 55%,#d97706 100%)',
    shadow: '#78350f',
    shine: '#fde68a',
    label: { ar: 'أذكاري', fr: 'Adhkars', en: 'Adhkar' },
    deco: '🌙',
  },
  {
    id: 'stories',
    emoji: '📚',
    bg: 'linear-gradient(160deg,#a78bfa 0%,#8b5cf6 55%,#6d28d9 100%)',
    shadow: '#4c1d95',
    shine: '#ddd6fe',
    label: { ar: 'قصصي', fr: 'Histoires', en: 'Stories' },
    deco: '⭐',
  },
  {
    id: 'games',
    emoji: '🎮',
    bg: 'linear-gradient(160deg,#f472b6 0%,#ec4899 55%,#be185d 100%)',
    shadow: '#831843',
    shine: '#fce7f3',
    label: { ar: 'ألعابي', fr: 'Jeux', en: 'Games' },
    deco: '🎯',
  },
];

// Floating decoration items
const FLOATERS = [
  { emoji: '🦋', x: '8%',  y: '18%', size: 28, dur: 7,  delay: 0,   sh: '#7c3aed' },
  { emoji: '🌸', x: '85%', y: '12%', size: 26, dur: 5,  delay: 1,   sh: '#db2777' },
  { emoji: '🌈', x: '78%', y: '22%', size: 30, dur: 8,  delay: 0.5, sh: '#f59e0b' },
  { emoji: '🦋', x: '88%', y: '55%', size: 22, dur: 6,  delay: 2,   sh: '#6d28d9' },
  { emoji: '🌺', x: '5%',  y: '60%', size: 24, dur: 7,  delay: 1.5, sh: '#be185d' },
  { emoji: '💫', x: '50%', y: '8%',  size: 20, dur: 4,  delay: 0.8, sh: '#f59e0b' },
  { emoji: '🌻', x: '15%', y: '78%', size: 26, dur: 6,  delay: 0.3, sh: '#b45309' },
  { emoji: '🌻', x: '75%', y: '78%', size: 26, dur: 5,  delay: 1.2, sh: '#b45309' },
  { emoji: '🐝', x: '60%', y: '15%', size: 20, dur: 5,  delay: 2.5, sh: '#d97706' },
  { emoji: '🌟', x: '30%', y: '6%',  size: 22, dur: 3.5,delay: 0.6, sh: '#d97706' },
];

const CLOUDS = [
  { top: '4%',  left: '5%',  size: 52, op: 0.85, dur: 9,  dx: 14 },
  { top: '2%',  left: '42%', size: 38, op: 0.70, dur: 12, dx: 10 },
  { top: '8%',  left: '72%', size: 46, op: 0.80, dur: 10, dx: 12 },
];

export default function ChildHome() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { user, getAuthHeaders, isLoading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();

  const today = getLocalYYYYMMDD();

  const { data: child } = useGetChild(childId, { request: getAuthHeaders() });
  const { data: progress } = useGetProgress(childId, { date: today }, { request: getAuthHeaders() });
  const { data: morningTasks = [] } = useGetTasks(childId, { routineType: GetTasksRoutineType.morning }, { request: getAuthHeaders() });
  const { data: eveningTasks = [] } = useGetTasks(childId, { routineType: GetTasksRoutineType.evening }, { request: getAuthHeaders() });

  const [adhkarStats, setAdhkarStats] = useState<AdhkarStats | null>(null);
  useEffect(() => {
    const fetchAdhkar = () => {
      const token = localStorage.getItem('authToken');
      if (!token || !childId) return;
      fetch(`/api/children/${childId}/adhkar`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setAdhkarStats(d); });
    };
    fetchAdhkar();
    // Re-fetch when user navigates back to this page
    document.addEventListener('visibilitychange', fetchAdhkar);
    window.addEventListener('focus', fetchAdhkar);
    return () => {
      document.removeEventListener('visibilitychange', fetchAdhkar);
      window.removeEventListener('focus', fetchAdhkar);
    };
  }, [childId]);

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [authLoading, user, setLocation]);

  if (authLoading || !user || !child) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#bae6fd 0%,#e0f2fe 100%)' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500" />
    </div>
  );

  const morningDone = morningTasks.filter(t => progress?.morningCompletions?.some(c => c.taskId === t.id && c.completed)).length;
  const eveningDone = eveningTasks.filter(t => progress?.eveningCompletions?.some(c => c.taskId === t.id && c.completed)).length;
  const mTotal = morningTasks.length;
  const eTotal = eveningTasks.length;
  const morningAllDone = mTotal > 0 && morningDone === mTotal;
  const eveningAllDone = eTotal > 0 && eveningDone === eTotal;
  const totalStars = (progress?.starsEarned ?? 0) || (child.totalStars ?? 0);

  const handleCardClick = (cardId: string) => {
    if (cardId === 'routine') setLocation(`/child/${childId}/routine`);
    else if (cardId === 'adhkar') setLocation(`/child/${childId}/adhkar`);
    else if (cardId === 'stories') setLocation(`/child/${childId}/stories`);
    else if (cardId === 'games') setLocation(`/child/${childId}/games`);
  };

  const getProgressBadge = (cardId: string) => {
    if (cardId === 'routine') {
      const bothDone = morningAllDone && eveningAllDone;
      const eitherDone = morningAllDone || eveningAllDone;
      return bothDone ? 'all' : eitherDone ? 'partial' : null;
    }
    if (cardId === 'adhkar') {
      const bothDone = adhkarStats?.morningDoneToday && adhkarStats?.eveningDoneToday;
      const eitherDone = adhkarStats?.morningDoneToday || adhkarStats?.eveningDoneToday;
      return bothDone ? 'all' : eitherDone ? 'partial' : null;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#7dd3fc 0%,#bae6fd 30%,#e0f7fa 65%,#b9f6ca 100%)' }}>

      {/* ── Sun ── */}
      <motion.div className="absolute pointer-events-none select-none"
        style={{ top: '-18px', left: '50%', translateX: '-50%', fontSize: 90, zIndex: 0,
          filter: 'drop-shadow(0 4px 0 #f97316) drop-shadow(0 8px 0 #b45309) drop-shadow(0 14px 18px rgba(251,146,60,0.5))',
        }}
        animate={{ scale: [1, 1.06, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
        ☀️
      </motion.div>

      {/* ── Clouds ── */}
      {CLOUDS.map((c, i) => (
        <motion.div key={i} className="absolute pointer-events-none select-none text-white"
          style={{ top: c.top, left: c.left, fontSize: c.size, opacity: c.op, zIndex: 1,
            filter: 'drop-shadow(3px 5px 0 rgba(147,197,253,0.7)) drop-shadow(6px 9px 8px rgba(59,130,246,0.3))',
          }}
          animate={{ x: [0, c.dx, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}>
          ☁️
        </motion.div>
      ))}

      {/* ── Floating decorations ── */}
      {FLOATERS.map((f, i) => (
        <motion.div key={i} className="absolute pointer-events-none select-none"
          style={{ left: f.x, top: f.y, fontSize: f.size, zIndex: 1,
            filter: `drop-shadow(2px 3px 0 ${f.sh}88) drop-shadow(4px 6px 0 ${f.sh}55) drop-shadow(6px 8px 10px rgba(0,0,0,0.25))`,
          }}
          animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}>
          {f.emoji}
        </motion.div>
      ))}

      {/* ── Ground strip ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none select-none z-0"
        style={{ background: 'linear-gradient(180deg,transparent 0%,#bbf7d0 60%,#86efac 100%)' }}>
        {/* Grass tufts */}
        {['5%','18%','32%','47%','61%','74%','88%'].map((x, i) => (
          <motion.div key={i} className="absolute bottom-4 text-3xl"
            style={{ left: x,
              filter: 'drop-shadow(2px 3px 0 #15803d88) drop-shadow(4px 5px 8px rgba(0,0,0,0.2))',
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
            🌿
          </motion.div>
        ))}
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 px-4 pt-5 pb-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">

          {/* Back + avatar */}
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setLocation("/")}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white text-xl font-black"
              style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)' }}>
              ←
            </motion.button>
            <motion.div whileTap={{ scale: 0.92 }} onClick={() => setLocation(`/child/${childId}/edit`)}
              className="relative cursor-pointer">
              <div className="rounded-full border-4 border-white shadow-xl"
                style={{ boxShadow: '0 0 0 3px #fbbf24, 0 6px 20px #0003' }}>
                <AvatarDisplay avatar={child.avatar} name={child.name} size={50} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                <Settings className="w-3 h-3 text-slate-400" />
              </div>
            </motion.div>
          </div>

          {/* Stars pill */}
          <motion.div whileHover={{ scale: 1.06 }}
            className="flex items-center gap-2 px-5 py-2 rounded-full shadow-xl border-2 border-white/80"
            style={{ background: 'linear-gradient(135deg,#fde68a,#fbbf24)' }}>
            <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2, repeat: Infinity }}>⭐</motion.span>
            <span className="text-xl font-black text-amber-800">{totalStars}</span>
          </motion.div>

          {/* Name pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-xl border-2 border-white/80"
            style={{ background: 'linear-gradient(135deg,#ddd6fe,#c4b5fd)' }}>
            <span className="font-black text-violet-800 text-sm max-w-[72px] truncate">{child.name}</span>
            <div className="rounded-full border-2 border-white shadow">
              <AvatarDisplay avatar={child.avatar} name={child.name} size={30} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Greeting banner ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="relative z-10 mx-auto max-w-lg w-full px-4 mt-2 mb-1">
        <div className="flex items-center justify-center gap-2 py-2 px-6 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#fff9c4cc,#fffde7cc)', backdropFilter: 'blur(6px)', border: '2px solid #fde68a' }}>
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>👋</motion.span>
          <span className="font-black text-amber-700 text-base">
            {lang === 'ar' ? `أهلاً ${child.name}!` : lang === 'fr' ? `Bonjour ${child.name}!` : `Hello ${child.name}!`}
          </span>
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>🌟</motion.span>
        </div>
      </motion.div>

      {/* ── Cards grid ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 py-2 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          {CARDS.map((card, i) => {
            const label = card.label[lang as 'ar' | 'fr' | 'en'] ?? card.label.en;
            const badge = getProgressBadge(card.id);

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, scale: 0.7, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 18 }}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleCardClick(card.id)}
                className="relative rounded-[2rem] overflow-hidden flex flex-col items-center justify-between pt-5 pb-4 px-3 text-white"
                style={{
                  background: card.bg,
                  boxShadow: `0 10px 0 0 ${card.shadow}, 0 18px 40px ${card.shadow}66`,
                  minHeight: 195,
                  border: '3px solid rgba(255,255,255,0.35)',
                }}
              >
                {/* Top shine */}
                <div className="absolute top-0 left-0 right-0 h-2/5 rounded-t-[2rem]"
                  style={{ background: `linear-gradient(180deg,${card.shine}55,transparent)` }} />

                {/* Corner deco emoji */}
                <div className="absolute top-3 end-3 text-xl opacity-60 select-none">{card.deco}</div>

                {/* Done badge */}
                {badge === 'all' && (
                  <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="absolute top-3 start-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg z-10">
                    <span className="text-green-500 text-lg font-black">✓</span>
                  </motion.div>
                )}
                {badge === 'partial' && (
                  <div className="absolute top-3 start-3 w-9 h-9 rounded-full bg-white/40 border-2 border-white flex items-center justify-center z-10">
                    <span className="text-white text-xs font-black">½</span>
                  </div>
                )}

                {/* Main emoji with bounce + 3D extrusion */}
                <motion.div className="relative z-10 leading-none"
                  style={{ fontSize: 72,
                    filter: `drop-shadow(3px 3px 0 ${card.shadow}) drop-shadow(6px 6px 0 ${card.shadow}99) drop-shadow(9px 10px 14px rgba(0,0,0,0.35))`,
                  }}
                  animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}>
                  {card.emoji}
                </motion.div>

                {/* Progress bar for routine */}
                {card.id === 'routine' && (
                  <div className="relative z-10 w-full px-1 mb-1">
                    <div className="flex justify-between text-xs font-bold opacity-90 mb-1">
                      <span>☀️ {morningDone}/{mTotal}</span>
                      <span>{eveningDone}/{eTotal} 🌙</span>
                    </div>
                    <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg,#fff,#bbf7d0)' }}
                        initial={{ width: 0 }}
                        animate={{ width: mTotal + eTotal > 0 ? `${((morningDone + eveningDone) / (mTotal + eTotal)) * 100}%` : '0%' }}
                        transition={{ duration: 1, delay: 0.4 }} />
                    </div>
                  </div>
                )}

                {/* Progress counter for adhkar — daily */}
                {card.id === 'adhkar' && (
                  <div className="relative z-10 w-full px-1 mb-1">
                    <div className="flex justify-between text-xs font-bold opacity-90 mb-1">
                      <span>☀️ {adhkarStats?.morningDoneToday ? '9' : '0'}/9</span>
                      <span>{adhkarStats?.eveningDoneToday ? '9' : '0'}/9 🌙</span>
                    </div>
                    <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg,#fff,#bbf7d0)' }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((adhkarStats?.morningDoneToday ? 9 : 0) + (adhkarStats?.eveningDoneToday ? 9 : 0)) / 18 * 100}%`
                        }}
                        transition={{ duration: 1, delay: 0.4 }} />
                    </div>
                  </div>
                )}

                {/* Label bar */}
                <div className="relative z-10 w-full">
                  <div className="rounded-2xl py-2 px-2 text-center"
                    style={{ background: `${card.shadow}bb`, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)' }}>
                    <p className="font-black text-base tracking-wide leading-tight drop-shadow">{label}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Level badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex items-center justify-center mt-4 mb-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-6 py-2.5 rounded-full shadow-xl border-2 border-white/70"
            style={{ background: 'linear-gradient(135deg,#fef9c3,#fde68a)' }}>
            <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>🏆</motion.span>
            <span className="font-black text-amber-800 text-sm">{child.name}</span>
            <span className="text-xs bg-amber-500 text-white font-black px-2 py-0.5 rounded-full">Lvl {child.level || 1}</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
