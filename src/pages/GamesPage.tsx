import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useGetChild } from "@workspace/api-client-react";
import { MemoryGame } from "@/components/games/MemoryGame";
import { MathGame } from "@/components/games/MathGame";
import { ColorGame } from "@/components/games/ColorGame";

const GAMES = [
  { id: 'memory', emoji: '🧩', color: '#7c3aed', shadow: '#5b21b6', label: { ar: 'الذاكرة', fr: 'Mémoire', en: 'Memory' } },
  { id: 'math',   emoji: '🔢', color: '#f59e0b', shadow: '#b45309', label: { ar: 'الحساب',  fr: 'Maths',   en: 'Math Quiz' } },
  { id: 'colors', emoji: '🌈', color: '#ec4899', shadow: '#be185d', label: { ar: 'الألوان',  fr: 'Couleurs', en: 'Colors' } },
];

export default function GamesPage() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [wins, setWins] = useState<Record<string, number>>({});
  const { getAuthHeaders } = useAuth();
  const { data: child } = useGetChild(childId, { request: getAuthHeaders() });
  const childAge = child?.age ?? 6;

  const L = {
    ar: { title: 'الألعاب التعليمية', back: 'رجوع', chooseGame: 'اختر لعبتك!', stars: 'نجوم', play: 'العب' },
    fr: { title: 'Jeux Éducatifs',   back: 'Retour', chooseGame: 'Choisis ton jeu !', stars: 'étoiles', play: 'Jouer' },
    en: { title: 'Educational Games', back: 'Back', chooseGame: 'Choose your game!', stars: 'stars', play: 'Play' },
  }[lang as 'ar' | 'fr' | 'en'] ?? { title: 'Games', back: 'Back', chooseGame: 'Pick a game!', stars: 'stars', play: 'Play' };

  const handleWin = (gameId: string, score: number) => {
    setWins(prev => ({ ...prev, [gameId]: Math.max(prev[gameId] ?? 0, score) }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #ede9fe 50%, #e0f2fe 100%)' }}>
      {/* Polka dots */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #a855f722 2px, transparent 2px)',
        backgroundSize: '36px 36px'
      }} />

      {/* Floating decorations — 3D */}
      {[
        {e:'🌟',sh:'#d97706'},{e:'⭐',sh:'#b45309'},{e:'✨',sh:'#f59e0b'},{e:'💫',sh:'#f97316'},
        {e:'🎮',sh:'#5b21b6'},{e:'🎯',sh:'#be185d'},{e:'🎨',sh:'#0369a1'},{e:'🔢',sh:'#b45309'},
      ].map((item, i) => (
        <motion.div key={i} className="absolute pointer-events-none text-2xl"
          style={{ left: `${(i * 12) + 4}%`, top: `${[5,12,8,15,6,11,7,14][i]}%`,
            filter: `drop-shadow(2px 3px 0 ${item.sh}99) drop-shadow(4px 5px 8px rgba(0,0,0,0.25))`,
          }}
          animate={{ y: [0, -14, 0], rotate: [0, 15, -15, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        >{item.e}</motion.div>
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => activeGame ? setActiveGame(null) : setLocation(`/child/${childId}`)}
          className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-full shadow-md text-white text-sm"
          style={{ background: '#7c3aed' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {L.back}
        </motion.button>
        <h1 className="text-xl font-display font-bold text-violet-700">{L.title}</h1>
        <div className="w-20" />
      </header>

      <main className="relative z-10 max-w-sm mx-auto px-4 pt-2 pb-10">
        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Total stars */}
              <motion.div
                className="flex items-center justify-center gap-3 bg-white/80 backdrop-blur rounded-3xl px-6 py-4 mb-6 shadow-lg border-4 border-white mt-2"
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              >
                <span className="text-4xl">🏆</span>
                <div className="text-center">
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-wide">{L.stars} {L.title}</p>
                  <p className="text-3xl font-black text-violet-700">
                    {Object.values(wins).reduce((a, b) => a + b, 0)} ⭐
                  </p>
                </div>
                {childAge >= 7 && (
                  <span className="ms-auto text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded-full">
                    🔥 {lang === 'ar' ? 'متقدم' : lang === 'fr' ? 'Avancé' : 'Advanced'}
                  </span>
                )}
              </motion.div>

              <p className="text-center text-lg font-bold text-violet-600 mb-5">{L.chooseGame}</p>

              <div className="flex flex-col gap-4">
                {GAMES.map((game, i) => {
                  const label = game.label[lang as 'ar' | 'fr' | 'en'] ?? game.label.en;
                  const best = wins[game.id];
                  return (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 220 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveGame(game.id)}
                      className="w-full rounded-[2rem] p-5 text-white text-start relative overflow-hidden shadow-xl"
                      style={{ background: game.color, boxShadow: `0 8px 0 0 ${game.shadow}, 0 12px 28px ${game.color}55` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-[2rem]" />
                      <div className="relative flex items-center gap-4">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1], y:[0,-6,0] }}
                          transition={{ duration: 2 + i, repeat: Infinity }}
                          style={{ fontSize:'3rem',
                            filter: `drop-shadow(3px 3px 0 ${game.shadow}) drop-shadow(6px 6px 0 ${game.shadow}99) drop-shadow(9px 10px 14px rgba(0,0,0,0.35))`,
                          }}
                        >
                          {game.emoji}
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-white/70 text-xs font-bold uppercase tracking-wide">
                            {lang === 'ar' ? 'لعبة تعليمية' : lang === 'fr' ? 'Jeu éducatif' : 'Educational game'}
                          </p>
                          <h2 className="text-2xl font-display font-bold">{label}</h2>
                          {best !== undefined && (
                            <p className="text-white/80 text-sm mt-0.5">
                              ⭐ {lang === 'ar' ? `أفضل نتيجة: ${best}` : lang === 'fr' ? `Meilleur: ${best}` : `Best: ${best}`}
                            </p>
                          )}
                        </div>
                        <motion.div
                          className="text-3xl"
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
                        >
                          ▶️
                        </motion.div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              {/* Game header */}
              {(() => {
                const game = GAMES.find(g => g.id === activeGame)!;
                const label = game.label[lang as 'ar' | 'fr' | 'en'] ?? game.label.en;
                return (
                  <div className="flex items-center gap-3 mb-5 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 shadow-md border-2 border-white">
                    <span className="text-3xl">{game.emoji}</span>
                    <h2 className="text-xl font-display font-bold" style={{ color: game.color }}>{label}</h2>
                    {wins[activeGame] !== undefined && (
                      <span className="ms-auto text-sm font-bold" style={{ color: game.shadow }}>
                        ⭐ {wins[activeGame]}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Game content */}
              <div className="bg-white/80 backdrop-blur rounded-3xl p-5 shadow-xl border-4 border-white">
                {activeGame === 'memory' && (
                  <MemoryGame lang={lang} age={childAge} onWin={(moves) => handleWin('memory', Math.max(0, 20 - moves))} />
                )}
                {activeGame === 'math' && (
                  <MathGame lang={lang} age={childAge} onWin={(score) => handleWin('math', score)} />
                )}
                {activeGame === 'colors' && (
                  <ColorGame lang={lang} age={childAge} onWin={(score) => handleWin('colors', score)} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
