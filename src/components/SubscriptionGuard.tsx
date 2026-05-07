import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  children: ReactNode;
}

export default function SubscriptionGuard({ children }: Props) {
  const [, setLocation] = useLocation();
  const { token, user, isLoading } = useAuth();
  const [subLoading, setSubLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) { setLocation("/login"); return; }

    // Check subscription status
    fetch("/api/subscription/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.hasAccess) {
          setHasAccess(true);
        } else {
          setLocation("/subscription");
        }
      })
      .catch(() => {
        // If subscription check fails, allow access (be lenient)
        setHasAccess(true);
      })
      .finally(() => setSubLoading(false));
  }, [isLoading, token, user, setLocation]);

  if (isLoading || subLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!token || !user || !hasAccess) return null;

  return <>{children}</>;
}
