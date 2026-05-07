import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const LANGS = [
  { code: 'ar' as const, label: 'Ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en' as const, label: 'En', name: 'English',  flag: '🇬🇧' },
  { code: 'fr' as const, label: 'Fr', name: 'Français', flag: '🇫🇷' },
];

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { login } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const tagline = { ar: 'روتينك اليومي 🌟', en: 'Your Daily Routine 🌟', fr: 'Ta Routine Quotidienne 🌟' }[lang] ?? 'Your Daily Routine 🌟';
  const errLogin = { ar: 'فشل تسجيل الدخول. تحقق من بياناتك.', en: 'Login failed. Please check your credentials.', fr: 'Échec de connexion. Vérifiez vos identifiants.' }[lang];
  const errRegister = { ar: 'فشل إنشاء الحساب.', en: 'Account creation failed.', fr: 'Échec de création du compte.' }[lang];
  const namePlaceholder = { ar: 'اسمك الكامل', en: 'Your full name', fr: 'Votre nom complet' }[lang];
  const currentLabel = LANGS.find(l => l.code === lang)?.label ?? 'En';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: (res) => { login(res.token); setLocation("/"); },
        onError: () => toast({ variant: "destructive", title: errLogin }),
      });
    } else {
      registerMutation.mutate({ data: { email, password, name } }, {
        onSuccess: (res) => { login(res.token); setLocation("/"); },
        onError: () => toast({ variant: "destructive", title: errRegister }),
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 25%, #a855f7 60%, #ec4899 100%)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Animated background blobs */}
      <div className="floating-blob w-96 h-96 bg-pink-400 top-[-10%] left-[-10%]" style={{ animationDelay: '0s' }} />
      <div className="floating-blob w-80 h-80 bg-violet-300 bottom-[-10%] right-[-5%]" style={{ animationDelay: '3s' }} />
      <div className="floating-blob w-64 h-64 bg-fuchsia-400 top-[40%] left-[5%]" style={{ animationDelay: '5s' }} />

      {/* Floating stars */}
      {['⭐', '✨', '🌟', '💫', '⭐', '✨'].map((s, i) => (
        <div key={i} className="absolute pointer-events-none select-none text-2xl opacity-40 animate-bounce"
          style={{ top: `${[12, 70, 25, 80, 45, 15][i]}%`, left: `${[8, 85, 92, 12, 50, 60][i]}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${2 + i * 0.3}s` }}
        >{s}</div>
      ))}

      {/* Language picker — top right */}
      <div className="absolute top-4 end-4 z-50">
        <button
          onClick={() => setLangMenuOpen(v => !v)}
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2 border-white/30 bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
        >
          {currentLabel}
        </button>
        {langMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
            <div className="absolute top-12 end-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-w-[140px]" style={{ direction: 'ltr' }}>
              {LANGS.map(({ code, label, name: langName, flag }) => (
                <button key={code}
                  onClick={() => { setLang(code); setLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-violet-50 ${lang === code ? 'text-violet-700 bg-violet-50' : 'text-slate-600'}`}
                >
                  <span className="text-lg">{flag}</span>
                  <span>{langName}</span>
                  {lang === code && <span className="ms-auto text-violet-500">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute inset-0 rounded-[2rem] bg-white/20 blur-xl" />
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="Routini"
              className="relative w-28 h-28 mx-auto rounded-[2rem] shadow-2xl border-4 border-white/40"
            />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mt-5 drop-shadow-lg">{t('welcome')}</h1>
          <p className="text-white/70 mt-1 text-lg">{tagline}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/15 backdrop-blur-md rounded-2xl p-1.5 mb-5 border border-white/20">
          {[
            { key: true, icon: '🔑', label: t('login') },
            { key: false, icon: '✨', label: t('register') },
          ].map(tab => (
            <button
              key={String(tab.key)}
              onClick={() => setIsLogin(tab.key)}
              className={`flex-1 py-3 rounded-xl font-bold text-base transition-all duration-300 ${
                isLogin === tab.key ? 'bg-white text-violet-700 shadow-lg' : 'text-white/70 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-[2rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="block text-sm font-bold text-violet-700 mb-1">{t('name')}</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder={namePlaceholder}
                    className="rounded-xl border-2 border-violet-100 bg-violet-50 py-5 text-base focus-visible:ring-violet-400 focus-visible:border-violet-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-violet-700">{t('email')}</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                dir="ltr"
                className="rounded-xl border-2 border-violet-100 bg-violet-50 py-5 text-base focus-visible:ring-violet-400 focus-visible:border-violet-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-violet-700">{t('password')}</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                dir="ltr"
                className="rounded-xl border-2 border-violet-100 bg-violet-50 py-5 text-base focus-visible:ring-violet-400 focus-visible:border-violet-400"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full gradient-btn bouncy-btn rounded-2xl py-4 text-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isLogin ? t('login') : t('register')}...
                </span>
              ) : (
                isLogin ? `🔑 ${t('login')}` : `✨ ${t('register')}`
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          Routini © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
