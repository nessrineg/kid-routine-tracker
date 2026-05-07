import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";

export interface SubscriptionStatus {
  hasAccess: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
  trialEndsAt: string | null;
  subscriptionActive: boolean;
  plan: "monthly" | "yearly" | null;
  currentPeriodEnd: string | null;
  provider: "stripe" | null;
}

export function useSubscription() {
  const { token } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!token) { setIsLoading(false); return; }
    try {
      const res = await fetch("/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStatus(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const startCheckout = async (plan: "monthly" | "yearly"): Promise<void> => {
    if (!token) throw new Error("Not authenticated");
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create checkout session");
    }
    const { url } = await res.json();
    window.location.href = url;
  };

  const openPortal = async (): Promise<void> => {
    if (!token) throw new Error("Not authenticated");
    const res = await fetch("/api/subscription/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to open portal");
    }
    const { url } = await res.json();
    window.location.href = url;
  };

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    startCheckout,
    openPortal,
  };
}
