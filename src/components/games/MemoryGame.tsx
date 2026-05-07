import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸','🐧','🦄','🦋','🌸','🍎','🚀','⚽','🎸'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createDeck(pairs: number): Card[] {
  const chosen = EMOJIS.slice(0, pairs);
  const doubled = [...chosen, ...chosen];
  return shuffle(doubled).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

interface Props {
  lang: string;
  age?: number;
  onWin: (moves: number) => void;
}

export function MemoryGame({ lang, age = 6, onWin }: Props) {
  const hard = age >= 7;
  const pairs = hard ? (age >= 10 ? 9 : 8) : 6;
  const cols = hard ? (age >= 10 ? 6 : 5) : 4;

  const [cards, setCards] = useState<Card[]>(() => createDeck(pairs));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const matched = cards.filter(c => c.matched).length;

  useEffect(() => {
    if (matched === pairs * 2 && !won) {
      setWon(true);
      onWin(moves);
    }
  }, [matched, moves, won, onWin, pairs]);

  const flip = (id: number) => {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      setMoves(m => m + 1);
      const [a, b] = newSelected.map(sid => newCards.find(c => c.id === sid)!);
      if (a.emoji === b.emoji) {
        setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, matched: true } : c));
        setSelected([]);
        setLocked(false);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
          setLocked(false);
        }, hard ? 700 : 900);
      }
    }
  };

  const restart = () => {
    setCards(createDeck(pairs));
    setSelected([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
  };

  const label = {
    ar: { moves: 'محاولة', restart: 'ابدأ من جديد', win: '🎉 أحسنت! أكملت اللعبة!', pairs: `${matched / 2} / ${pairs} أزواج` },
    fr: { moves: 'essais', restart: 'Rejouer', win: '🎉 Bravo ! Tu as tout trouvé !', pairs: `${matched / 2} / ${pairs} paires` },
    en: { moves: 'moves', restart: 'Play again', win: '🎉 Amazing! You found them all!', pairs: `${matched / 2} / ${pairs} pairs` },
  }[lang as 'ar' | 'fr' | 'en'] ?? { moves: 'moves', restart: 'Play again', win: '🎉 Amazing!', pairs: `${matched / 2} / ${pairs}` };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full px-2">
        <span className="font-bold text-slate-600 text-sm">🔄 {moves} {label.moves}</span>
        <span className="font-bold text-violet-600 text-sm">{label.pairs}</span>
        <button onClick={restart} className="text-xs font-bold text-white bg-violet-500 px-3 py-1.5 rounded-full hover:bg-violet-600 transition">
          {label.restart}
        </button>
      </div>

      {hard && (
        <span className="text-xs bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full">
          {lang === 'ar' ? '🔥 وضع متقدم' : lang === 'fr' ? '🔥 Mode avancé' : '🔥 Advanced Mode'}
        </span>
      )}

      <div className={`grid gap-2 w-full`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => flip(card.id)}
            className="aspect-square rounded-2xl flex items-center justify-center select-none cursor-pointer border-2 transition-colors duration-200"
            style={{
              fontSize: hard ? '1.4rem' : '1.75rem',
              background: card.matched ? '#d1fae5' : card.flipped ? '#ede9fe' : '#6d28d9',
              borderColor: card.matched ? '#34d399' : card.flipped ? '#a78bfa' : '#5b21b6',
              boxShadow: card.matched ? '0 2px 0 #10b981' : card.flipped ? '0 2px 0 #7c3aed' : '0 4px 0 #4c1d95',
            }}
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.span key="face" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: 0.2 }}>
                  {card.emoji}
                </motion.span>
              ) : (
                <motion.span key="back" className="text-white text-xl">❓</motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {won && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
          className="bg-green-100 border-4 border-green-400 rounded-3xl px-6 py-4 text-center">
          <p className="text-xl font-bold text-green-700">{label.win}</p>
          <p className="text-sm text-green-600 mt-1">✅ {moves} {label.moves}</p>
          <button onClick={restart} className="mt-3 bg-green-500 text-white font-bold px-6 py-2 rounded-full hover:bg-green-600 transition">
            {label.restart}
          </button>
        </motion.div>
      )}
    </div>
  );
}
