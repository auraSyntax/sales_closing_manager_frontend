"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useRedux";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastRoute', window.location.pathname);
      }
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;
  return <>{children}</>;
} 