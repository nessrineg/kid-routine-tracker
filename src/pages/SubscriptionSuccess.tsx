import { useEffect } from "react";
import { useLocation } from "wouter";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLocation("/"), 4000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)" }}
    >
      <div className="text-8xl mb-6 animate-bounce">🎉</div>
      <h1 className="text-white text-4xl font-black mb-3">مبروك!</h1>
      <p className="text-white/80 text-lg mb-2">اشتراكك فعّال الآن</p>
      <p className="text-white/60 text-sm">سيتم توجيهك تلقائياً...</p>
      <button
        onClick={() => setLocation("/")}
        className="mt-8 bg-white text-purple-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-white/90 transition-all"
      >
        العودة للرئيسية
      </button>
    </div>
  );
}
