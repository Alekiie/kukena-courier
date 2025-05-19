"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
      }
    }, []);

    return <Component {...props} />;
  };
}
