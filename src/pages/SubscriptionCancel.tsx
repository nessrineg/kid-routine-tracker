import { useLocation } from "wouter";

export default function SubscriptionCancel() {
  const [, setLocation] = useLocation();

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)" }}
    >
      <div className="text-7xl mb-6">😕</div>
      <h1 className="text-white text-3xl font-black mb-3">تم إلغاء الدفع</h1>
      <p className="text-white/80 text-base mb-6">لم يتم خصم أي مبلغ من حسابك</p>
      <div className="flex gap-3">
        <button
          onClick={() => setLocation("/subscription")}
          className="bg-white text-purple-700 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/90 transition-all"
        >
          المحاولة مجدداً
        </button>
        <button
          onClick={() => setLocation("/")}
          className="bg-white/20 text-white font-bold px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all"
        >
          رجوع
        </button>
      </div>
    </div>
  );
}
