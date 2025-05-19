"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { TownProvider } from "../context/TownsContext";
import LayoutShell from "./layoutShell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth(); // Use the hook here
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Simulate a quick check for token existence
      const token = localStorage.getItem("access_token");
      const isLoggedIn = !!token;

      if (!isLoggedIn && pathname !== "/login" && pathname !== "/register") {
        router.replace("/login");
      } else if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        router.replace("/");
      }
      setLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, pathname, router]);

  if (loading) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  return (
    <TownProvider>
      <LayoutShell>{children}</LayoutShell>
    </TownProvider>
  );
}