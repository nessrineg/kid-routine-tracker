import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  label: string;
  answer: number;
  choices: number[];
}

function generateQuestion(age: number): Question {
  const hard = age >= 7;
  const veryHard = age >= 10;

  let label: string;
  let answer: number;

  if (veryHard) {
    // Age 10-12: multiplication, division, mixed large numbers
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      // Multiplication up to 12×12
      const a = Math.floor(Math.random() * 9) + 3;
      const b = Math.floor(Math.random() * 9) + 3;
      answer = a * b;
      label = `${a} × ${b}`;
    } else if (type === 1) {
      // Division
      const b = Math.floor(Math.random() * 9) + 2;
      const q = Math.floor(Math.random() * 9) + 2;
      const a = b * q;
      answer = q;
      label = `${a} ÷ ${b}`;
    } else if (type === 2) {
      // Large addition
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      answer = a + b;
      label = `${a} + ${b}`;
    } else {
      // Large subtraction
      const a = Math.floor(Math.random() * 80) + 20;
      const b = Math.floor(Math.random() * (a - 10)) + 5;
      answer = a - b;
      label = `${a} − ${b}`;
    }
  } else if (hard) {
    // Age 7-9: multiplication up to 5×, subtraction with larger numbers
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 9) + 1;
      answer = a * b;
      label = `${a} × ${b}`;
    } else if (type === 1) {
      const a = Math.floor(Math.random() * 40) + 10;
      const b = Math.floor(Math.random() * 9) + 1;
      answer = a + b;
      label = `${a} + ${b}`;
    } else {
      const a = Math.floor(Math.random() * 30) + 15;
      const b = Math.floor(Math.random() * 14) + 1;
      answer = a - b;
      label = `${a} − ${b}`;
    }
  } else {
    // Age ≤ 6: simple add/subtract with numbers 1-9
    const isAdd = Math.random() > 0.4;
    let a: number, b: number;
    if (isAdd) {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      answer = a + b;
      label = `${a} + ${b}`;
    } else {
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
      label = `${a} − ${b}`;
    }
  }

  const spread = veryHard ? 15 : hard ? 8 : 5;
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const wrong = answer + Math.floor(Math.random() * (spread * 2 + 1)) - spread;
    if (wrong !== answer && wrong >= 0) choices.add(wrong);
  }
  return { label, answer, choices: [...choices].sort(() => Math.random() - 0.5) };
}

const TOTAL = 8;

interface Props {
  lang: string;
  age?: number;
  onWin: (score: number) => void;
}

export function MathGame({ lang, age = 6, onWin }: Props) {
  const hard = age >= 7;
  const [questions] = useState<Question[]>(() => Array.from({ length: TOTAL }, () => generateQuestion(age)));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[current];

  const pick = (choice: number) => {
    if (chosen !== null) return;
    setChosen(choice);
    const correct = choice === q.answer;
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (current + 1 >= TOTAL) {
        setDone(true);
        onWin(score + (correct ? 1 : 0));
      } else {
        setCurrent(c => c + 1);
        setChosen(null);
      }
    }, 900);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setChosen(null);
    setDone(false);
  };

  const L = {
    ar:  { title: 'سؤال', score: 'نقاط', restart: 'العب مجدداً', win: '🎉 ممتاز!', of: 'من', correct: 'صح ✅', wrong: 'خطأ ❌' },
    fr:  { title: 'question', score: 'points', restart: 'Rejouer', win: '🎉 Excellent !', of: 'sur', correct: 'Correct ✅', wrong: 'Faux ❌' },
    en:  { title: 'question', score: 'points', restart: 'Play again', win: '🎉 Excellent!', of: 'of', correct: 'Correct ✅', wrong: 'Wrong ❌' },
  }[lang as 'ar' | 'fr' | 'en'] ?? { title: 'question', score: 'points', restart: 'Play again', win: '🎉', of: 'of', correct: '✅', wrong: '❌' };

  if (done) return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
      className="flex flex-col items-center gap-4 py-4">
      <div className="text-6xl">🏆</div>
      <p className="text-2xl font-bold text-amber-600">{L.win}</p>
      <p className="text-lg font-bold text-slate-700">{score} / {TOTAL} {L.score}</p>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span key={i} className="text-2xl">{i < score ? '⭐' : '☆'}</span>
        ))}
      </div>
      <button onClick={restart} className="mt-2 bg-amber-500 text-white font-bold px-8 py-3 rounded-full hover:bg-amber-600 transition text-lg shadow">
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
            <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < current ? 'bg-amber-400' : i === current ? 'bg-amber-500 scale-125' : 'bg-slate-200'}`} />
          ))}
        </div>
        <span className="text-sm font-bold text-amber-600">⭐ {score}</span>
      </div>

      {hard && (
        <span className="text-xs bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full">
          {lang === 'ar' ? '🔥 وضع متقدم' : lang === 'fr' ? '🔥 Mode avancé' : '🔥 Advanced Mode'}
        </span>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="bg-amber-50 border-4 border-amber-300 rounded-3xl px-8 py-6 text-center shadow-lg"
        >
          <p className="text-4xl font-black text-slate-800 tracking-wider">
            {q.label} = <span className="text-amber-500">?</span>
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {q.choices.map(choice => {
          const isCorrect = choice === q.answer;
          const isPicked = chosen === choice;
          let bg = 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50 hover:border-amber-300';
          if (chosen !== null) {
            if (isCorrect) bg = 'bg-green-100 border-green-400 text-green-800';
            else if (isPicked) bg = 'bg-red-100 border-red-400 text-red-800';
            else bg = 'bg-white border-slate-200 text-slate-400';
          }
          return (
            <motion.button
              key={choice}
              whileTap={{ scale: chosen === null ? 0.94 : 1 }}
              onClick={() => pick(choice)}
              className={`py-4 rounded-2xl border-4 font-black text-3xl shadow transition-all ${bg}`}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>

      {chosen !== null && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-lg font-bold ${chosen === q.answer ? 'text-green-600' : 'text-red-600'}`}>
          {chosen === q.answer ? L.correct : `${L.wrong} → ${q.answer}`}
        </motion.p>
      )}
    </div>
  );
}
