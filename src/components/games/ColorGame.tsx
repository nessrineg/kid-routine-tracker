import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS_BASIC = [
  { name: { ar: 'أحمر',    fr: 'Rouge',  en: 'Red'    }, hex: '#ef4444', emoji: '🔴' },
  { name: { ar: 'أزرق',    fr: 'Bleu',   en: 'Blue'   }, hex: '#3b82f6', emoji: '🔵' },
  { name: { ar: 'أخضر',   fr: 'Vert',   en: 'Green'  }, hex: '#22c55e', emoji: '🟢' },
  { name: { ar: 'أصفر',   fr: 'Jaune',  en: 'Yellow' }, hex: '#eab308', emoji: '🟡' },
  { name: { ar: 'برتقالي', fr: 'Orange', en: 'Orange' }, hex: '#f97316', emoji: '🟠' },
  { name: { ar: 'بنفسجي', fr: 'Violet', en: 'Purple' }, hex: '#a855f7', emoji: '🟣' },
];

const COLORS_ALL = [
  ...COLORS_BASIC,
  { name: { ar: 'وردي',   fr: 'Rose',      en: 'Pink'      }, hex: '#ec4899', emoji: '🩷' },
  { name: { ar: 'بني',    fr: 'Marron',     en: 'Brown'     }, hex: '#92400e', emoji: '🟤' },
  { name: { ar: 'رمادي',  fr: 'Gris',       en: 'Gray'      }, hex: '#6b7280', emoji: '⬜' },
  { name: { ar: 'تركوازي', fr: 'Turquoise', en: 'Turquoise' }, hex: '#06b6d4', emoji: '🔷' },
  { name: { ar: 'ذهبي',   fr: 'Doré',       en: 'Gold'      }, hex: '#d97706', emoji: '🌟' },
  { name: { ar: 'فضي',    fr: 'Argenté',    en: 'Silver'    }, hex: '#9ca3af', emoji: '⚪' },
];

interface Round {
  correct: typeof COLORS_ALL[0];
  choices: typeof COLORS_ALL[0][];
}

function generateRound(hard: boolean): Round {
  const pool = hard ? COLORS_ALL : COLORS_BASIC;
  const choiceCount = hard ? 6 : 4;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const correct = shuffled[0];
  const choices = shuffled.slice(0, choiceCount).sort(() => Math.random() - 0.5);
  if (!choices.find(c => c.hex === correct.hex)) {
    choices[Math.floor(Math.random() * choiceCount)] = correct;
  }
  return { correct, choices };
}

const TOTAL = 8;

interface Props {
  lang: string;
  age?: number;
  onWin: (score: number) => void;
}

export function ColorGame({ lang, age = 6, onWin }: Props) {
  const hard = age >= 7;
  const [rounds] = useState<Round[]>(() => Array.from({ length: TOTAL }, () => generateRound(hard)));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const r = rounds[current];
  const L = {
    ar: {
      question: hard ? 'ما اسم هذا اللون؟' : 'ما اسم هذا اللون؟',
      score: 'نقاط', restart: 'العب مجدداً',
      win: hard ? '🎉 ممتاز! تعرّفت على جميع الألوان!' : '🎉 رائع! تعرّفت على الألوان!',
      correct: 'صح ✅', wrong: 'خطأ ❌'
    },
    fr: {
      question: hard ? 'Quelle est cette couleur ?' : 'Quelle est cette couleur ?',
      score: 'points', restart: 'Rejouer',
      win: hard ? '🎉 Excellent ! Tu connais toutes les couleurs !' : '🎉 Super ! Tu connais les couleurs !',
      correct: 'Correct ✅', wrong: 'Faux ❌'
    },
    en: {
      question: hard ? 'What color is this?' : 'What color is this?',
      score: 'points', restart: 'Play again',
      win: hard ? '🎉 Excellent! You know all the colors!' : '🎉 Great! You know your colors!',
      correct: 'Correct ✅', wrong: 'Wrong ❌'
    },
  }[lang as 'ar' | 'fr' | 'en'] ?? { question: 'What color?', score: 'pts', restart: 'Again', win: '🎉', correct: '✅', wrong: '❌' };

  const pick = (hex: string) => {
    if (chosen) return;
    setChosen(hex);
    const correct = hex === r.correct.hex;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= TOTAL) { setDone(true); onWin(score + (correct ? 1 : 0)); }
      else { setCurrent(c => c + 1); setChosen(null); }
    }, 900);
  };

  const restart = () => { setCurrent(0); setScore(0); setChosen(null); setDone(false); };

  if (done) return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
      className="flex flex-col items-center gap-4 py-4">
      <div className="text-6xl">🌈</div>
      <p className="text-2xl font-bold text-pink-600">{L.win}</p>
      <p className="text-lg font-bold text-slate-700">{score} / {TOTAL} {L.score}</p>
      <div className="flex gap-1 mt-1 flex-wrap justify-center">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span key={i} className="text-2xl">{i < score ? '⭐' : '☆'}</span>
        ))}
      </div>
      <button onClick={restart} className="mt-2 bg-pink-500 text-white font-bold px-8 py-3 rounded-full hover:bg-pink-600 transition text-lg shadow">
        {L.restart}
      </button>
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-sm font-bold text-slate-500">{current + 1} / {TOTAL}</span>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < current ? 'bg-pink-400' : i === current ? 'bg-pink-500 scale-125' : 'bg-slate-200'}`} />
          ))}
        </div>
        <span className="text-sm font-bold text-pink-600">⭐ {score}</span>
      </div>

      {hard && (
        <span className="text-xs bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full">
          {lang === 'ar' ? '🔥 وضع متقدم' : lang === 'fr' ? '🔥 Mode avancé' : '🔥 Advanced Mode'}
        </span>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-32 h-32 rounded-full shadow-2xl border-8 border-white"
          style={{ background: r.correct.hex }}
        />
      </AnimatePresence>

      <p className="text-lg font-bold text-slate-700">{L.question}</p>

      <div className={`grid gap-2.5 w-full max-w-xs ${hard ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {r.choices.map(color => {
          const isCorrect = color.hex === r.correct.hex;
          const isPicked = chosen === color.hex;
          const name = color.name[lang as 'ar' | 'fr' | 'en'] ?? color.name.en;
          let cls = 'bg-white border-slate-200 text-slate-800 hover:border-pink-300 hover:bg-pink-50';
          if (chosen) {
            if (isCorrect) cls = 'bg-green-100 border-green-400 text-green-800';
            else if (isPicked) cls = 'bg-red-100 border-red-400 text-red-800';
            else cls = 'bg-white border-slate-200 text-slate-400';
          }
          return (
            <motion.button
              key={color.hex}
              whileTap={{ scale: chosen ? 1 : 0.94 }}
              onClick={() => pick(color.hex)}
              className={`flex items-center gap-2 py-2.5 px-3 rounded-2xl border-4 font-bold shadow transition-all ${hard ? 'text-sm' : 'text-lg'} ${cls}`}
            >
              <span className={hard ? 'text-lg' : 'text-2xl'}>{color.emoji}</span>
              <span>{name}</span>
            </motion.button>
          );
        })}
      </div>

      {chosen && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-lg font-bold ${chosen === r.correct.hex ? 'text-green-600' : 'text-red-600'}`}>
          {chosen === r.correct.hex ? L.correct : `${L.wrong} → ${r.correct.name[lang as 'ar' | 'fr' | 'en'] ?? r.correct.name.en}`}
        </motion.p>
      )}
    </div>
  );
}
