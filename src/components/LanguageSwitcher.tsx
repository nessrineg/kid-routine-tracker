import { useLanguage } from "@/lib/i18n";
import { clsx } from "clsx";

const LANGS = [
  { code: 'ar', flag: '🇸🇦', label: 'العربية', short: 'AR' },
  { code: 'en', flag: '🇬🇧', label: 'English',  short: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'Français', short: 'FR' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/30 backdrop-blur-xl rounded-full px-3 py-2 shadow-2xl border border-white/20">
      {LANGS.map(({ code, flag, label, short }) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code as 'en' | 'ar' | 'fr')}
            title={label}
            className={clsx(
              "flex items-center gap-1.5 rounded-full font-bold transition-all duration-300 select-none",
              isActive
                ? "px-4 py-2 text-white text-sm shadow-lg scale-105"
                : "px-3 py-2 text-white/60 hover:text-white/90 text-sm hover:scale-105"
            )}
            style={isActive ? {
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              boxShadow: '0 4px 15px rgba(168,85,247,0.5)',
            } : {}}
          >
            <span className="text-base leading-none">{flag}</span>
            <span className={clsx("leading-none", isActive ? "block" : "hidden sm:block")}>{short}</span>
          </button>
        );
      })}
    </div>
  );
}
