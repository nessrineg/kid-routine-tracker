import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";

const PLANS = {
  monthly: { price: "9.99", currency: "€", period: "/شهر", periodFr: "/mois", periodEn: "/month", savings: null },
  yearly:  { price: "100", currency: "€", period: "/سنة",  periodFr: "/an",   periodEn: "/year",  savings: "17%" },
};

export default function SubscriptionPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { status, isLoading, fetchStatus, startCheckout, openPortal } = useSubscription();
  const { lang } = useLanguage();

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => { fetchStatus(); }, []);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      await startCheckout(selectedPlan);
    } catch (err: any) {
      setCheckoutError(err.message || "حدث خطأ. حاول مرة أخرى.");
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try { await openPortal(); } catch { setPortalLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)" }}>
        <div className="text-white text-2xl animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  const plan = PLANS[selectedPlan];

  const T = {
    title:    lang === 'ar' ? 'روتيني بريميوم' : lang === 'fr' ? 'Routini Premium' : 'Routini Premium',
    subtitle: lang === 'ar' ? 'كل ما يحتاجه طفلك ليومه المميز' : lang === 'fr' ? 'Tout pour la routine de votre enfant' : 'Everything your child needs for a great day',
    features: lang === 'ar'
      ? ['🌅 روتين الصباح والمساء', '🏆 نظام النجوم والمكافآت', '📅 الجدول الأسبوعي', '🤲 أذكار الصباح والمساء', '👨‍👩‍👧 إضافة عدة أطفال', '🌍 3 لغات عربي/فر/إن']
      : lang === 'fr'
      ? ['🌅 Routine matin & soir', '🏆 Étoiles & récompenses', '📅 Planning hebdomadaire', '🤲 Douas matin & soir', '👨‍👩‍👧 Plusieurs enfants', '🌍 3 langues']
      : ['🌅 Morning & evening routine', '🏆 Stars & rewards system', '📅 Weekly schedule', '🤲 Morning & evening Adhkar', '👨‍👩‍👧 Multiple children', '🌍 Arabic / French / English'],
    trialNote: lang === 'ar' ? '7 أيام مجانية · ألغِ في أي وقت' : lang === 'fr' ? '7 jours gratuits · Annulez à tout moment' : '7-day free trial · Cancel anytime',
    subscribe: lang === 'ar' ? 'ابدأ التجربة المجانية' : lang === 'fr' ? 'Commencer l\'essai gratuit' : 'Start Free Trial',
    manage:    lang === 'ar' ? 'إدارة الاشتراك والفواتير' : lang === 'fr' ? 'Gérer l\'abonnement' : 'Manage Subscription',
    active:    lang === 'ar' ? '✓ اشتراكك فعّال' : lang === 'fr' ? '✓ Abonnement actif' : '✓ Subscription active',
    back:      lang === 'ar' ? '← رجوع' : lang === 'fr' ? '← Retour' : '← Back',
    logout:    lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Déconnexion' : 'Log out',
    monthly:   lang === 'ar' ? 'شهري' : lang === 'fr' ? 'Mensuel' : 'Monthly',
    yearly:    lang === 'ar' ? 'سنوي' : lang === 'fr' ? 'Annuel' : 'Yearly',
    save:      lang === 'ar' ? 'وفر' : lang === 'fr' ? 'Économisez' : 'Save',
    renews:    lang === 'ar' ? 'يجدد في' : lang === 'fr' ? 'Renouvellement' : 'Renews',
  };

  const period = lang === 'ar' ? plan.period : lang === 'fr' ? plan.periodFr : plan.periodEn;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)" }}>

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <button onClick={() => setLocation("/")}
          className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 text-sm font-bold backdrop-blur-sm transition-all">
          {T.back}
        </button>
        <span className="text-white/70 text-sm">{user?.name}</span>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">⭐</div>
        <h1 className="text-white text-3xl font-black mb-2">{T.title}</h1>
        <p className="text-white/80 text-sm">{T.subtitle}</p>
      </div>

      {/* Status badge */}
      {status?.subscriptionActive && (
        <div className="mb-6 w-full max-w-md bg-green-400/20 border border-green-300/40 text-green-100 rounded-2xl px-6 py-3 text-center backdrop-blur-sm">
          <div className="font-bold">{T.active}</div>
          {status.currentPeriodEnd && (
            <div className="text-sm mt-1">
              {T.renews} {new Date(status.currentPeriodEnd).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
            </div>
          )}
        </div>
      )}
      {status?.trialActive && !status.subscriptionActive && (
        <div className="mb-6 w-full max-w-md bg-yellow-400/20 border border-yellow-300/40 text-yellow-100 rounded-2xl px-6 py-3 text-center backdrop-blur-sm">
          <div className="font-bold">
            🎁 {lang === 'ar' ? `تجربة مجانية · ${status.trialDaysLeft} أيام متبقية` : `Free trial · ${status.trialDaysLeft} days left`}
          </div>
        </div>
      )}
      {status && !status.trialActive && !status.subscriptionActive && (
        <div className="mb-6 w-full max-w-md bg-red-400/20 border border-red-300/40 text-red-100 rounded-2xl px-6 py-3 text-center backdrop-blur-sm">
          <div className="font-bold">⏰ {lang === 'ar' ? 'انتهت الفترة التجريبية — اشترك للمتابعة' : 'Trial expired — subscribe to continue'}</div>
        </div>
      )}

      {/* Features */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/20">
        <div className="grid grid-cols-2 gap-2">
          {T.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-white/90">
              <span className="text-lg">{f.split(' ')[0]}</span>
              <span className="text-xs font-medium">{f.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan selector + checkout (shown when not subscribed) */}
      {!status?.subscriptionActive && (
        <div className="w-full max-w-md space-y-4">
          {/* Plan cards */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setSelectedPlan("yearly")}
              className={`rounded-2xl p-4 border-2 transition-all text-${lang === 'ar' ? 'right' : 'left'} relative ${selectedPlan === "yearly"
                ? "border-white bg-white/25 scale-[1.02] shadow-lg"
                : "border-white/30 bg-white/10 hover:bg-white/15"}`}>
              {PLANS.yearly.savings && (
                <div className={`absolute top-2 ${lang === 'ar' ? 'right-2' : 'left-2'}`}>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">
                    {T.save} {PLANS.yearly.savings}
                  </span>
                </div>
              )}
              <div className="mt-5 text-white font-black text-lg">{PLANS.yearly.currency}{PLANS.yearly.price}</div>
              <div className="text-white/70 text-xs">{T.yearly} · {lang === 'ar' ? '≈€8.33/شهر' : '≈€8.33/mo'}</div>
              {selectedPlan === "yearly" && <div className="text-white text-lg mt-1">✓</div>}
            </button>

            <button onClick={() => setSelectedPlan("monthly")}
              className={`rounded-2xl p-4 border-2 transition-all text-${lang === 'ar' ? 'right' : 'left'} ${selectedPlan === "monthly"
                ? "border-white bg-white/25 scale-[1.02] shadow-lg"
                : "border-white/30 bg-white/10 hover:bg-white/15"}`}>
              <div className="mt-5 text-white font-black text-lg">{PLANS.monthly.currency}{PLANS.monthly.price}</div>
              <div className="text-white/70 text-xs">{T.monthly}</div>
              {selectedPlan === "monthly" && <div className="text-white text-lg mt-1">✓</div>}
            </button>
          </div>

          {checkoutError && (
            <div className="bg-red-400/20 border border-red-300/40 text-red-100 rounded-2xl px-4 py-3 text-center text-sm">
              {checkoutError}
            </div>
          )}

          <button onClick={handleCheckout} disabled={checkoutLoading}
            className="w-full bg-white text-violet-700 font-black py-4 rounded-3xl shadow-lg hover:bg-white/90 transition-all disabled:opacity-60 text-lg">
            {checkoutLoading ? "⏳..." : `${T.subscribe} — ${plan.currency}${plan.price}${period}`}
          </button>

          <p className="text-white/50 text-xs text-center">{T.trialNote}</p>
        </div>
      )}

      {/* Manage subscription (when active) */}
      {status?.subscriptionActive && (
        <div className="w-full max-w-md space-y-3">
          <button onClick={handlePortal} disabled={portalLoading}
            className="w-full bg-white text-violet-700 font-bold py-3 rounded-3xl shadow-lg hover:bg-white/90 transition-all disabled:opacity-60">
            {portalLoading ? "⏳..." : T.manage}
          </button>
        </div>
      )}

      <button onClick={() => { logout(); setLocation("/login"); }}
        className="mt-8 text-white/40 text-sm hover:text-white/70 transition-colors">
        {T.logout}
      </button>
    </div>
  );
}
