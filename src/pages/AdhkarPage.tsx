import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, RotateCcw, CalendarDays } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "@/lib/i18n";
import { playSound } from "@/lib/audio";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { useGetChild, useGetProgress } from "@workspace/api-client-react";

interface Dhikr {
  arabic: string;
  label: { ar: string; fr: string; en: string };
  repeat: number;
  note?: { ar: string; fr: string; en: string };
  wide?: boolean;
  sections?: { label: string; arabic: string }[];
}

const MORNING_ADHKAR: Dhikr[] = [
  {
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    label: { ar: 'آية الكرسي', fr: 'Ayat Al Koursi', en: 'Ayat Al Koursi' },
    repeat: 1,
  },
  {
    arabic: '',
    label: { ar: 'المعوِّذات', fr: 'Al-Muawwidhatan', en: 'The Refuge Surahs' },
    repeat: 1,
    sections: [
      { label: 'الإخلاص', arabic: '﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾' },
      { label: 'الفلق', arabic: '﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾' },
      { label: 'الناس', arabic: '﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾' },
    ],
  },
  {
    arabic: 'رَضِيتُ بِاللهِ رَبَّاً وَبِالإِسْلَامِ دِيناً وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيَّاً وَرَسُولاً',
    label: { ar: 'الرضا بالله', fr: 'L\'agrément', en: 'Contentment' },
    repeat: 1,
  },
  {
    arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    label: { ar: 'بسم الله', fr: 'Au nom d\'Allah', en: 'In the name of Allah' },
    repeat: 1,
  },
  {
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    label: { ar: 'أصبحنا', fr: 'Du matin', en: 'Morning dhikr' },
    repeat: 1,
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمَاً نَافِعَاً، وَرِزْقَاً طَيِّبَاً، وَعَمَلاً مُتَقَبَّلاً',
    label: { ar: 'دعاء الصباح', fr: 'Invocation du matin', en: 'Morning supplication' },
    repeat: 1,
  },
  {
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.\nاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    label: { ar: 'العافية', fr: 'La santé', en: 'For well-being' },
    repeat: 1,
  },
  {
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    label: { ar: 'سبحان الله', fr: 'Gloire à Allah', en: 'Glory be to Allah' },
    repeat: 1,
  },
  {
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ،\nأَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    label: { ar: 'سيد الاستغفار', fr: 'Maître de la demande de pardon', en: 'Master of forgiveness' },
    repeat: 1,
  },
];

const EVENING_ADHKAR: Dhikr[] = [
  {
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    label: { ar: 'آية الكرسي', fr: 'Ayat Al Koursi', en: 'Ayat Al Koursi' },
    repeat: 1,
  },
  {
    arabic: '',
    label: { ar: 'المعوِّذات', fr: 'Al-Muawwidhatan', en: 'The Refuge Surahs' },
    repeat: 1,
    sections: [
      { label: 'الإخلاص', arabic: '﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾' },
      { label: 'الفلق', arabic: '﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾' },
      { label: 'الناس', arabic: '﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾' },
    ],
  },
  {
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    label: { ar: 'التعوذ', fr: 'Protection', en: 'Seeking protection' },
    repeat: 1,
  },
  {
    arabic: 'رَضِيتُ بِاللهِ رَبَّاً وَبِالإِسْلَامِ دِيناً وَبِمُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ نَبِيَّاً وَرَسُولاً',
    label: { ar: 'الرضا بالله', fr: 'L\'agrément', en: 'Contentment' },
    repeat: 1,
  },
  {
    arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    label: { ar: 'بسم الله', fr: 'Au nom d\'Allah', en: 'In the name of Allah' },
    repeat: 1,
  },
  {
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    label: { ar: 'أمسينا', fr: 'Du soir', en: 'Evening dhikr' },
    repeat: 1,
  },
  {
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.\nاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    label: { ar: 'العافية', fr: 'La santé', en: 'For well-being' },
    repeat: 1,
  },
  {
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    label: { ar: 'سبحان الله', fr: 'Gloire à Allah', en: 'Glory be to Allah' },
    repeat: 1,
  },
  {
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ،\nأَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    label: { ar: 'سيد الاستغفار', fr: 'Maître de la demande de pardon', en: 'Master of forgiveness' },
    repeat: 1,
  },
];

export default function AdhkarPage() {
  const { id } = useParams();
  const childId = parseInt(id!);
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { getAuthHeaders } = useAuth();
  const urlType = new URLSearchParams(window.location.search).get('type') as 'morning' | 'evening' | null;
  const [type, setType] = useState<'morning' | 'evening' | null>(urlType);
  const [allCounts, setAllCounts] = useState<{ morning: Record<number, number>; evening: Record<number, number> }>({
    morning: {}, evening: {},
  });
  const counts = type ? allCounts[type] : {};

  // ── Derived state (must be before useEffects that use them) ──────
  const adhkar = type === 'morning' ? MORNING_ADHKAR : type === 'evening' ? EVENING_ADHKAR : [];
  const allDone = adhkar.length > 0 && adhkar.every((d, i) => (counts[i] ?? 0) >= d.repeat);

  // ── Adhkar stats (daily + weekly from server) ────────────────────
  const [adhkarStats, setAdhkarStats] = useState<{
    morningDoneToday: boolean;
    eveningDoneToday: boolean;
    morningWeekCount: number;
    eveningWeekCount: number;
  } | null>(null);

  const fetchAdhkarStats = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !childId) return;
    try {
      const res = await fetch(`/api/children/${childId}/adhkar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAdhkarStats(await res.json());
    } catch {}
  }, [childId]);

  useEffect(() => { fetchAdhkarStats(); }, [fetchAdhkarStats]);

  // Pre-fill counts when entering a session that's already completed today
  useEffect(() => {
    if (!type || !adhkarStats) return;
    const isDone = type === 'morning' ? adhkarStats.morningDoneToday : adhkarStats.eveningDoneToday;
    if (isDone) {
      const sessionAdhkar = type === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;
      const fullCounts: Record<number, number> = {};
      sessionAdhkar.forEach((d, i) => { fullCounts[i] = d.repeat; });
      setAllCounts(prev => ({ ...prev, [type]: fullCounts }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, adhkarStats?.morningDoneToday, adhkarStats?.eveningDoneToday]);

  // POST completion when all adhkar done
  const postedRef = useRef<string | null>(null);
  useEffect(() => {
    if (allDone && type && postedRef.current !== type) {
      postedRef.current = type;
      const token = localStorage.getItem('authToken');
      if (!token) return;
      fetch(`/api/children/${childId}/adhkar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      }).then(r => r.ok ? r.json() : null).then(data => { if (data) setAdhkarStats(data); });
    }
    if (!allDone) postedRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, type]);

  // ── Celebration helpers ──────────────────────────────────────────
  const FW_COLORS = ['#ff4d6d','#ffd166','#06d6a0','#118ab2','#a855f7','#fb923c','#f472b6','#34d399'];
  const BALLOON_EMOJIS = ['🎈','🎈','🎉','🎊','🎈','🎉','🎊','🎈'];

  // Firework bursts: 5 launch sites, each with 10 particles
  const fireworks = useMemo(() =>
    [...Array(5)].map((_, b) => ({
      id: b,
      cx: 20 + b * 15,         // launch x% across screen
      cy: 20 + (b % 3) * 18,   // burst y% from top
      delay: b * 0.55,
      particles: [...Array(10)].map((_, p) => {
        const angle = (p / 10) * 2 * Math.PI;
        const dist = 60 + Math.random() * 60; // px
        return {
          id: p,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)],
          size: 6 + Math.random() * 6,
        };
      }),
    })), []);

  // Balloons: 8 floating up from bottom center zone
  const balloons = useMemo(() =>
    [...Array(8)].map((_, i) => ({
      id: i,
      emoji: BALLOON_EMOJIS[i % BALLOON_EMOJIS.length],
      x: 30 + Math.random() * 40,
      wobble: (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 8),
      delay: i * 0.3 + Math.random() * 0.4,
      dur: 3 + Math.random() * 2,
      size: 2 + Math.random() * 1.2,
    })), []);

  const { data: child } = useGetChild(childId, { request: getAuthHeaders() });
  const today = new Date().toISOString().split('T')[0];
  const { data: progress } = useGetProgress(childId, { date: today }, { request: getAuthHeaders() });
  // Scatter positions — fixed spots around screen edges, away from center buttons
  const BUBBLE_SLOTS = useMemo(() => [
    { left:  6, top: 18, size: 155, rotDir:  1, rotDur: 6.2, rotDelay: 0.0, floatDur: 4.1, pulseDur: 2.8, pulseDelay: 0.3, emoji:'✨' },
    { left: 76, top: 13, size: 148, rotDir: -1, rotDur: 7.5, rotDelay: 0.8, floatDur: 3.8, pulseDur: 3.2, pulseDelay: 1.1, emoji:'🌸' },
    { left: -6, top: 47, size: 128, rotDir:  1, rotDur: 5.8, rotDelay: 1.2, floatDur: 5.0, pulseDur: 2.6, pulseDelay: 0.7, emoji:'📿' },
    { left: 87, top: 51, size: 136, rotDir: -1, rotDur: 6.8, rotDelay: 0.4, floatDur: 4.5, pulseDur: 3.0, pulseDelay: 1.5, emoji:'💫' },
    { left:  5, top: 73, size: 150, rotDir:  1, rotDur: 7.2, rotDelay: 0.6, floatDur: 4.2, pulseDur: 2.9, pulseDelay: 0.5, emoji:'⭐' },
    { left: 75, top: 70, size: 145, rotDir: -1, rotDur: 6.0, rotDelay: 1.0, floatDur: 3.6, pulseDur: 3.1, pulseDelay: 0.9, emoji:'🌟' },
    { left: 40, top: 84, size: 134, rotDir:  1, rotDur: 8.0, rotDelay: 0.2, floatDur: 4.8, pulseDur: 2.7, pulseDelay: 1.3, emoji:'💛' },
  ], []);

  // ── Background nasheed — plays on entire AdhkarPage, stops on unmount ──
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const audio = new Audio(`${base}/nasheed-adhkar.mp3`);
    audio.loop = true;
    audio.volume = 0.18;
    audioRef.current = audio;
    audio.play().catch(() => {});

    // Pause on any click/touch
    const pause = () => {
      audioRef.current?.pause();
    };
    document.addEventListener('click', pause, { capture: true });
    document.addEventListener('touchstart', pause, { capture: true });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      document.removeEventListener('click', pause, { capture: true });
      document.removeEventListener('touchstart', pause, { capture: true });
    };
  }, []);

  // ── Celebration sound ──────────────────────────────────────────────
  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      prevAllDone.current = true;
      playSound('celebrate');
    } else if (!allDone) {
      prevAllDone.current = false;
    }
  }, [allDone]);
  const isMorning = type === 'morning';

  const increment = (i: number, max: number) => {
    if (!type) return;
    setAllCounts(prev => {
      const cur = prev[type][i] ?? 0;
      if (cur >= max) return prev;
      const next = cur + 1;
      playSound(next >= max ? 'check' : 'pop');
      return { ...prev, [type]: { ...prev[type], [i]: next } };
    });
  };

  const L = {
    ar: { title: 'الأذكار', morning: 'أذكار الصباح', evening: 'أذكار المساء', back: 'رجوع', choose: 'اختر وقت الذكر', times: 'مرة', done: 'اكتمل ✅', tap: 'اضغط', read: 'اقرأ' },
    fr: { title: 'Adhkars', morning: 'Adhkar du matin', evening: 'Adhkar du soir', back: 'Retour', choose: 'Choisissez le moment', times: 'fois', done: 'Complété ✅', tap: 'Toucher', read: 'Lire' },
    en: { title: 'Adhkar', morning: 'Morning Adhkar', evening: 'Evening Adhkar', back: 'Back', choose: 'Choose a time', times: 'times', done: 'Done ✅', tap: 'Tap', read: 'Read' },
  }[lang as 'ar' | 'fr' | 'en'] ?? { title: 'Adhkar', morning: 'Morning', evening: 'Evening', back: 'Back', choose: 'Choose', times: 'x', done: '✅', tap: 'Tap', read: 'Read' };

  const counterColor = isMorning
    ? { bg: '#fbbf24', hover: '#f59e0b', text: 'text-amber-900' }
    : { bg: '#34d399', hover: '#10b981', text: 'text-emerald-900' };

  const doneColor = isMorning ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50';
  const headerBg = isMorning
    ? 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)'
    : 'linear-gradient(135deg, #1e3a5f 0%, #1a237e 100%)';

  return (
    <div className="min-h-screen flex flex-col" dir="rtl"
      style={{ background: type === 'morning'
        ? '#bae6fd'
        : type === 'evening'
          ? 'linear-gradient(180deg, #1e3a5f 0%, #1a237e 40%, #0f172a 100%)'
          : 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 50%, #d1fae5 100%)' }}>

      {/* Morning hero background — same as routine page */}
      {type === 'morning' && (
        <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-morning.png`}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      )}

      {/* ── PICKER scene (main adhkar page) ── */}
      {!type && (<>
        {/* Sun left — 3D */}
        <motion.div className="fixed text-6xl pointer-events-none select-none z-20"
          style={{ top:10, left:'12%', opacity:0.85,
            filter:'drop-shadow(0 4px 0 #f97316) drop-shadow(0 8px 0 #b45309) drop-shadow(0 14px 18px rgba(251,146,60,0.55))',
          }}
          animate={{ rotate:[0,15,-15,0], scale:[1,1.1,1] }} transition={{ duration:5, repeat:Infinity }}>☀️</motion.div>
        {/* Sun rays */}
        {[0,60,120,180,240,300].map((deg,i)=>(
          <motion.div key={deg} className="fixed pointer-events-none select-none z-20"
            style={{ top:28, left:'19%', width:2, height:28, transformOrigin:'0 -42px',
              background:'rgba(251,191,36,0.45)', borderRadius:4,
              rotate:`${deg}deg`, translateX:'-50%' }}
            animate={{ scaleY:[1,1.5,1], opacity:[0.3,0.7,0.3] }}
            transition={{ duration:2, repeat:Infinity, delay:i*0.3 }} />
        ))}
        {/* Moon right — 3D */}
        <motion.div className="fixed text-5xl pointer-events-none select-none z-20"
          style={{ top:10, right:'10%', opacity:0.85,
            filter:'drop-shadow(3px 4px 0 #6d28d9) drop-shadow(6px 8px 0 #4c1d9599) drop-shadow(8px 12px 14px rgba(109,40,217,0.45))',
          }}
          animate={{ scale:[1,1.06,1] }} transition={{ duration:6, repeat:Infinity, delay:1 }}>🌙</motion.div>
        {/* Stars near moon */}
        {[{r:'18%',t:'5%',s:20},{r:'22%',t:'15%',s:16},{r:'8%',t:'18%',s:14}].map((s,i)=>(
          <motion.div key={i} className="fixed pointer-events-none select-none z-20 text-yellow-300"
            style={{ right:s.r, top:s.t, fontSize:s.s, opacity:0.6 }}
            animate={{ opacity:[0.3,0.9,0.3], scale:[1,1.3,1] }}
            transition={{ duration:1.5+i*0.5, repeat:Infinity, delay:i*0.4 }}>⭐</motion.div>
        ))}
        {/* Clouds — 3D */}
        {[{l:'3%',t:'22%',s:46,dur:9,dx:14},{l:'60%',t:'6%',s:38,dur:12,dx:10}].map((c,i)=>(
          <motion.div key={i} className="fixed pointer-events-none select-none z-20 text-white"
            style={{ left:c.l, top:c.t, fontSize:c.s, opacity:0.75,
              filter:'drop-shadow(3px 5px 0 rgba(147,197,253,0.7)) drop-shadow(6px 9px 8px rgba(59,130,246,0.3))',
            }}
            animate={{ x:[0,c.dx,0] }} transition={{ duration:c.dur, repeat:Infinity, ease:'easeInOut', delay:i*2 }}>☁️</motion.div>
        ))}
        {/* Bird flying — 3D */}
        <motion.div className="fixed pointer-events-none select-none text-2xl z-20"
          initial={{ x:'-10vw' }} animate={{ x:'110vw' }}
          transition={{ duration:12, repeat:Infinity, delay:2, ease:'linear' }}>
          <motion.span animate={{ y:[0,-6,0] }} transition={{ duration:0.7, repeat:Infinity }}
            style={{ display:'inline-block', filter:'drop-shadow(2px 3px 0 #cbd5e188) drop-shadow(4px 5px 8px rgba(0,0,0,0.25))' }}>🕊️</motion.span>
        </motion.div>
        {/* Rainbow — 3D */}
        <motion.div className="fixed pointer-events-none select-none z-20 text-6xl"
          style={{ bottom:'30%', left:'50%', translateX:'-50%', opacity:0.35,
            filter:'drop-shadow(4px 6px 0 rgba(99,102,241,0.4)) drop-shadow(8px 10px 16px rgba(0,0,0,0.2))',
          }}
          animate={{ scale:[1,1.05,1], opacity:[0.28,0.45,0.28] }}
          transition={{ duration:5, repeat:Infinity }}>🌈</motion.div>
        {/* Shooting star — 3D */}
        <motion.div className="fixed pointer-events-none select-none z-20 text-2xl"
          style={{ top:'12%', left:'-5%', opacity:0,
            filter:'drop-shadow(2px 3px 0 #f59e0b99) drop-shadow(5px 6px 8px rgba(251,146,60,0.4))',
          }}
          animate={{ x:['0vw','110vw'], y:['0vh','18vh'], opacity:[0,1,1,0] }}
          transition={{ duration:2.5, repeat:Infinity, repeatDelay:7, ease:'easeIn' }}>🌠</motion.div>
        {/* Angels — 3D */}
        {[{l:'4%',t:'38%',d:0},{l:'84%',t:'42%',d:1.5}].map((a,i)=>(
          <motion.div key={i} className="fixed text-3xl pointer-events-none select-none z-20"
            style={{ left:a.l, top:a.t, opacity:0.55,
              filter:'drop-shadow(2px 3px 0 #f9a8d499) drop-shadow(4px 6px 10px rgba(0,0,0,0.25))',
            }}
            animate={{ y:[0,-14,0], rotate:[0,8,-8,0] }}
            transition={{ duration:4+i, repeat:Infinity, delay:a.d }}>👼</motion.div>
        ))}
        {/* Sparkles — 3D */}
        {[{l:'8%',t:'55%',e:'✨',sh:'#f59e0b'},{l:'86%',t:'60%',e:'💫',sh:'#f97316'},{l:'48%',t:'72%',e:'🌟',sh:'#d97706'},{l:'22%',t:'72%',e:'⭐',sh:'#b45309'},{l:'72%',t:'28%',e:'💛',sh:'#d97706'}].map((s,i)=>(
          <motion.div key={i} className="fixed text-xl pointer-events-none select-none z-20"
            style={{ left:s.l, top:s.t, opacity:0.55,
              filter:`drop-shadow(2px 2px 0 ${s.sh}99) drop-shadow(4px 4px 8px rgba(0,0,0,0.2))`,
            }}
            animate={{ y:[0,-10,0], scale:[1,1.3,1] }}
            transition={{ duration:2.5+i*0.5, repeat:Infinity, delay:i*0.4 }}>{s.e}</motion.div>
        ))}
        {/* ── ALL BUBBLES — scatter layout covering screen edges ── */}
        {BUBBLE_SLOTS.map((slot, i) => {
          const { left, top, size, rotDir, rotDur, rotDelay, floatDur, pulseDur, pulseDelay, emoji } = slot;
          const orbitEmoji = ['💫','⭐','✨','🌸','💛','🌟','💙'][i % 7];
          return (
            <div key={i} className="fixed pointer-events-none z-20"
              style={{ left:`calc(${left}% - ${size/2}px)`, top:`calc(${top}% - ${size/2}px)`, perspective:'600px' }}>

              <motion.div style={{ position:'relative', width:size, height:size, transformStyle:'preserve-3d' }}
                animate={{
                  rotateY:[rotDir*-14, rotDir*14, rotDir*-14],
                  rotateX:[3,-3,3],
                  y:[0,-14,0],
                  scale:[1, 1.12, 0.95, 1.06, 1],
                }}
                transition={{
                  rotateY: { duration:rotDur, repeat:Infinity, ease:'easeInOut', delay:rotDelay },
                  rotateX: { duration:rotDur, repeat:Infinity, ease:'easeInOut', delay:rotDelay },
                  y:       { duration:rotDur, repeat:Infinity, ease:'easeInOut', delay:rotDelay },
                  scale:   { duration:pulseDur, repeat:Infinity, ease:'easeInOut', delay:pulseDelay },
                }}>
                {/* Soap shell */}
                <div style={{ position:'absolute', inset:0, borderRadius:'50%',
                  background:'radial-gradient(circle at 32% 25%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.14) 16%, rgba(200,225,255,0.04) 52%, rgba(210,235,255,0.14) 100%)',
                  border:'1.5px solid rgba(255,255,255,0.52)',
                  boxShadow:'0 10px 40px rgba(120,180,255,0.12), inset 0 -10px 22px rgba(180,215,255,0.07), inset 0 10px 18px rgba(255,255,255,0.1)',
                  backdropFilter:'blur(2px)',
                }} />
                <div style={{ position:'absolute', inset:0, borderRadius:'50%',
                  background:'radial-gradient(circle at 67% 70%, rgba(255,255,255,0.2) 0%, transparent 38%)',
                }} />
                <div style={{ position:'absolute', borderRadius:'50%',
                  width:'28%', height:'17%', top:'10%', left:'20%',
                  background:'rgba(255,255,255,0.8)', filter:'blur(7px)', transform:'rotate(-22deg)',
                }} />
                <div style={{ position:'absolute', borderRadius:'50%',
                  width:'12%', height:'7%', top:'20%', left:'53%',
                  background:'rgba(255,255,255,0.55)', filter:'blur(4px)',
                }} />
                {/* Center emoji */}
                <motion.div style={{ position:'absolute', top:'50%', left:'50%',
                  translateX:'-50%', translateY:'-50%', zIndex:3, fontSize: Math.round(size * 0.28) }}
                  animate={{ y:[0,-7,0], scale:[1,1.09,1], rotate:[0, rotDir*15, rotDir*-15, 0] }}
                  transition={{ duration:floatDur, repeat:Infinity, ease:'easeInOut', delay:rotDelay }}>
                  {emoji}
                </motion.div>
              </motion.div>

              {/* Orbiting sparkle */}
              <motion.div className="absolute text-sm" style={{
                top:'50%', left:'50%', opacity:0.7,
                x: size * 0.58 - 8, y: -size * 0.08,
              }}
                animate={{ rotate:[0, rotDir * 360] }}
                transition={{ duration:7+i, repeat:Infinity, ease:'linear', delay:rotDelay }}>
                {orbitEmoji}
              </motion.div>
            </div>
          );
        })}
      </>)}


      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-5 bg-white/20 backdrop-blur-md rounded-[2rem] p-3 shadow-sm border border-white/30 mx-4 mt-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => type ? setType(null) : setLocation(`/child/${childId}`)}
            className="rounded-full font-bold text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 me-1" />
            {lang === 'ar' ? 'رجوع' : lang === 'fr' ? 'Retour' : 'Back'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setLocation(`/child/${childId}/weekly`)}
            className="rounded-full font-bold text-white hover:bg-white/10"
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
          <span className="text-lg font-display font-bold text-white hidden sm:block">
            {child?.name}
          </span>
        </div>

        <div className="bg-yellow-400 text-yellow-950 px-3 py-1.5 rounded-full font-bold text-base shadow-inner flex items-center gap-2 border-2 border-yellow-300">
          ⭐ <span>{progress?.starsEarned || 0}</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-1 flex flex-col justify-center pt-6 pb-6">
        <AnimatePresence mode="wait">
          {!type ? (
            <motion.div key="choose" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex flex-col items-center gap-5">

              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { id:'morning', emoji:'☀️', label:L.morning, bg:'linear-gradient(135deg,#fbbf24,#f97316)', shadow:'#b45309',
                    doneToday: adhkarStats?.morningDoneToday ?? false, weekCount: adhkarStats?.morningWeekCount ?? 0 },
                  { id:'evening', emoji:'🌙', label:L.evening, bg:'linear-gradient(135deg,#1e3a5f,#1a237e)', shadow:'#0c1445',
                    doneToday: adhkarStats?.eveningDoneToday ?? false, weekCount: adhkarStats?.eveningWeekCount ?? 0 },
                ].map(opt => (
                  <div key={opt.id} className="flex flex-col gap-2">
                    <motion.button whileHover={{ scale:1.04, y:-4 }} whileTap={{ scale:0.96 }}
                      onClick={() => setType(opt.id as 'morning' | 'evening')}
                      className="rounded-[2rem] flex flex-col items-center justify-center gap-3 py-8 px-3 text-white shadow-xl relative overflow-hidden"
                      style={{ background:opt.bg, boxShadow:`0 8px 0 ${opt.shadow}` }}
                    >
                      <motion.div animate={{ rotate:[0,15,-15,0] }} transition={{ duration:3, repeat:Infinity }}
                        className="text-6xl">{opt.emoji}</motion.div>
                      <span className="font-bold text-lg">{opt.label}</span>
                    </motion.button>

                    {/* Reset button — appears only when this session is done */}
                    {opt.doneToday && (
                      <motion.button
                        initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                        whileTap={{ scale:0.94 }}
                        onClick={async () => {
                          const token = localStorage.getItem('authToken');
                          if (!token) return;
                          const res = await fetch(`/api/children/${childId}/adhkar`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ type: opt.id }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setAdhkarStats(data);
                            postedRef.current = null;
                            setAllCounts(prev => ({ ...prev, [opt.id]: {} }));
                          }
                        }}
                        className="w-full py-2 rounded-2xl bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {lang === 'ar' ? 'إعادة' : lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={type} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>

              {/* Dhikr list — 3 per row */}
              <div className="relative">
              <div className="grid grid-cols-3 gap-3">
              {adhkar.map((dhikr, i) => {
                const count = counts[i] ?? 0;
                const done = count >= dhikr.repeat;
                const lbl = dhikr.label[lang as 'ar' | 'fr' | 'en'] ?? dhikr.label.ar;

                return (
                  <motion.div key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => increment(i, dhikr.repeat)}
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: i * 0.04 }}
                    className={clsx(
                      "relative rounded-2xl border-4 cursor-pointer p-3 select-none transition-colors duration-300 flex flex-col overflow-hidden",
                      "h-[13rem]",
                      done
                        ? "bg-green-100 border-green-400 shadow-[0_5px_0_0_rgba(74,222,128,0.4)]"
                        : isMorning
                          ? "bg-white/90 border-white shadow-[0_5px_0_0_rgba(0,0,0,0.08)] backdrop-blur-sm"
                          : "bg-indigo-900/70 border-indigo-500 shadow-[0_5px_0_0_rgba(99,102,241,0.35)] backdrop-blur"
                    )}
                  >
                    {/* Top row: label + bubble counter */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={clsx(
                        "text-xs font-black px-2.5 py-0.5 rounded-full",
                        done
                          ? "bg-green-200 text-green-800"
                          : isMorning ? "bg-amber-100 text-amber-700" : "bg-indigo-700 text-amber-300"
                      )}>
                        {lbl}
                      </span>

                      {/* Bubble counter — ghost at 0, grows with each tap */}
                      <motion.div
                        key={`bubble-${i}`}
                        animate={{
                          scale: count === 0
                            ? 0.45
                            : 0.6 + 0.4 * Math.min(count / dhikr.repeat, 1),
                          opacity: count === 0 ? 0.35 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                        className={clsx(
                          "w-10 h-10 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-4 flex-shrink-0",
                          done
                            ? "bg-green-500 border-green-300 text-white"
                            : isMorning
                              ? "bg-amber-400 border-amber-200 text-white"
                              : "bg-purple-600 border-purple-400 text-white"
                        )}
                      >
                        {done ? (
                          <Check strokeWidth={3} className="w-5 h-5" />
                        ) : (
                          <>
                            <span className="text-base leading-none">{count}</span>
                            <span className="text-[9px] opacity-75 leading-none">/{dhikr.repeat}</span>
                          </>
                        )}
                      </motion.div>
                    </div>

                    {/* Sections card: each surah stacked with its name */}
                    {dhikr.sections ? (
                      <div className="flex flex-col gap-1 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                        {dhikr.sections.map((sec, si) => (
                          <div key={si} className="flex flex-col">
                            <span className={clsx(
                              "text-[0.55rem] font-black mb-0.5 text-right",
                              done ? "text-green-700" : isMorning ? "text-amber-600" : "text-amber-300"
                            )}>
                              ◆ {sec.label}
                            </span>
                            <p className={clsx(
                              "text-right leading-snug",
                              done ? "text-green-800 opacity-75" : isMorning ? "text-slate-800" : "text-white"
                            )}
                              style={{ fontFamily: 'serif', fontSize: '0.58rem', lineHeight: '1.5' }}>
                              {sec.arabic}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Normal card: full Arabic text */
                      <p
                        className={clsx(
                          "text-right leading-relaxed whitespace-pre-line flex-1 overflow-hidden line-clamp-3",
                          done ? "text-green-800 opacity-70" : isMorning ? "text-slate-800" : "text-white"
                        )}
                        style={{ fontFamily: 'serif', fontSize: '0.72rem', lineHeight: '1.6' }}
                      >
                        {dhikr.arabic}
                      </p>
                    )}

                  </motion.div>
                );
              })}
              </div>{/* end grid */}

                {/* Completion bubble — grows with each completed adhkar */}
                {adhkar.length > 0 && (() => {
                  const completedCount = adhkar.filter((d, idx) => (counts[idx] ?? 0) >= d.repeat).length;
                  const progress = completedCount / adhkar.length;
                  return (
                    <motion.div
                      animate={{ scale: 0.08 + 0.92 * progress, opacity: 0.15 + 0.85 * progress }}
                      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <motion.div
                        animate={allDone ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                        transition={{ duration: 3, repeat: allDone ? Infinity : 0, ease: 'easeInOut' }}
                        className={clsx(
                          "w-[90%] aspect-square rounded-full flex items-center justify-center",
                          isMorning
                            ? "bg-gradient-to-br from-yellow-200/60 via-white/70 to-green-200/60 border-4 border-yellow-300/80 shadow-[0_0_60px_20px_rgba(251,191,36,0.35)]"
                            : "bg-gradient-to-br from-indigo-400/40 via-white/20 to-purple-400/40 border-4 border-indigo-300/60 shadow-[0_0_60px_20px_rgba(99,102,241,0.4)]"
                        )}
                        style={{ backdropFilter: 'blur(12px)' }}
                      >
                        {allDone && (
                          <div className="flex flex-col items-center gap-3 px-6 text-center">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                              transition={{ duration: 2.5, repeat: Infinity }}
                              className="text-5xl"
                            >🌟</motion.div>
                            <p className={clsx("font-black text-lg leading-snug", isMorning ? "text-amber-800" : "text-indigo-900")}>
                              أحسنت!
                            </p>
                            <p className={clsx("font-bold text-sm leading-relaxed", isMorning ? "text-amber-700" : "text-indigo-800")}>
                              {isMorning ? 'لقد صنعت فقاعة حمايتك لليوم 🤲' : 'لقد صنعت فقاعة حمايتك لليلة 🤲'}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })()}
              </div>{/* end relative wrapper */}

              {/* Reset button — only visible when at least one dhikr has been tapped */}
              {Object.values(counts).some(v => v > 0) && (
              <div className="flex justify-center mt-6 mb-4">
                <button
                  onClick={async () => {
                    if (!type) return;
                    setAllCounts(prev => ({ ...prev, [type]: {} }));
                    postedRef.current = null;
                    const token = localStorage.getItem('authToken');
                    if (!token) return;
                    const res = await fetch(`/api/children/${childId}/adhkar`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ type }),
                    });
                    if (res.ok) { const data = await res.json(); setAdhkarStats(data); }
                  }}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-base shadow-md active:scale-95 transition-transform",
                    isMorning
                      ? "bg-amber-100 border-2 border-amber-300 text-amber-700 hover:bg-amber-200"
                      : "bg-indigo-800/60 border-2 border-indigo-400/60 text-indigo-100 hover:bg-indigo-700/70"
                  )}
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة الأذكار
                </button>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== CELEBRATION OVERLAY ===== */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {/* 🎆 Firework bursts */}
            {fireworks.map((fw) => (
              <div
                key={fw.id}
                style={{ position: 'absolute', left: `${fw.cx}%`, top: `${fw.cy}%` }}
              >
                {fw.particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: p.dx, y: p.dy, opacity: [1, 1, 0], scale: [1, 1.4, 0] }}
                    transition={{
                      duration: 1.1,
                      delay: fw.delay,
                      ease: 'easeOut',
                      repeat: Infinity,
                      repeatDelay: 2.2 + fw.delay,
                    }}
                    style={{
                      position: 'absolute',
                      width: p.size,
                      height: p.size,
                      borderRadius: '50%',
                      background: p.color,
                      boxShadow: `0 0 6px 2px ${p.color}`,
                    }}
                  />
                ))}
              </div>
            ))}

            {/* 🎈 Balloons floating up */}
            {balloons.map((b) => (
              <motion.div
                key={b.id}
                initial={{ y: '108vh', x: `${b.x}vw`, opacity: 1 }}
                animate={{
                  y: '-10vh',
                  x: [`${b.x}vw`, `${b.x + b.wobble}vw`, `${b.x}vw`],
                  opacity: [1, 1, 1, 0],
                }}
                transition={{
                  duration: b.dur,
                  delay: b.delay,
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: 1 + b.delay,
                }}
                style={{ position: 'absolute', fontSize: `${b.size}rem`, lineHeight: 1 }}
              >
                {b.emoji}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
