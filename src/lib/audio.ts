let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

/** Crisp clap burst from filtered noise */
const clap = (ac: AudioContext, t: number, vol = 0.5) => {
  const samples = Math.floor(ac.sampleRate * 0.09);
  const buf = ac.createBuffer(1, samples, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < samples; i++) d[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buf;

  const hpf = ac.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 1600;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

  src.connect(hpf);
  hpf.connect(gain);
  gain.connect(ac.destination);
  src.start(t);
  src.stop(t + 0.1);
};

/** Kids "Yay!" cheer voice synthesized from harmonics */
const cheer = (ac: AudioContext, t: number) => {
  // Simulate excited kids voices with multiple detuned oscillators
  const freqs = [350, 420, 500, 600, 720];
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sawtooth';
    // Each voice rises (like a "yay" exclamation)
    osc.frequency.setValueAtTime(f * 0.8, t + i * 0.03);
    osc.frequency.linearRampToValueAtTime(f * 1.2, t + 0.3 + i * 0.03);
    osc.frequency.linearRampToValueAtTime(f * 1.0, t + 0.7 + i * 0.03);

    const vol = 0.04;
    gain.gain.setValueAtTime(0, t + i * 0.03);
    gain.gain.linearRampToValueAtTime(vol, t + 0.05 + i * 0.03);
    gain.gain.setValueAtTime(vol, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9 + i * 0.04);

    // Low-pass to sound more "voice-like"
    const lpf = ac.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 1200;
    osc.disconnect(gain);
    osc.connect(lpf);
    lpf.connect(gain);

    osc.start(t + i * 0.03);
    osc.stop(t + 1.0 + i * 0.04);
  });
};

/** Rising celebratory tone */
const ding = (ac: AudioContext, freq: number, t: number, dur = 0.3, vol = 0.25) => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.01);
};

export const playSound = (type: 'check' | 'celebrate' | 'pop') => {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    if (type === 'check') {
      // ✅ Satisfying checkbox "check" sound — two-tone rising chime
      ding(ac, 880, now, 0.25, 0.28);         // A5
      ding(ac, 1320, now + 0.07, 0.35, 0.22); // E6
    }

    else if (type === 'pop') {
      // Soft descending blip for unchecking
      ding(ac, 660, now, 0.12, 0.15);
      ding(ac, 440, now + 0.06, 0.1, 0.10);
    }

    else if (type === 'celebrate') {
      // ✨ Magical level-up fanfare: rising arpeggio → sparkle shower → victory chord

      // Rising arpeggio (C major scale up)
      const melody = [523, 659, 784, 1047, 1319, 1568];
      melody.forEach((f, i) => ding(ac, f, now + i * 0.1, 0.35, 0.22));

      // Sparkle burst (high twinkling notes)
      const sparkles = [2093, 1760, 2349, 1976, 2637];
      sparkles.forEach((f, i) => ding(ac, f, now + 0.7 + i * 0.08, 0.25, 0.14));

      // Big triumphant chord landing
      [523, 659, 784, 1047].forEach(f => ding(ac, f, now + 1.2, 1.0, 0.18));

      // Ringing echo
      ding(ac, 1319, now + 1.5, 0.8, 0.12);
      ding(ac, 2093, now + 1.7, 0.9, 0.10);
    }

  } catch (e) {
    console.error('Audio error', e);
  }
};
