"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  const hideSidebarRoutes = ["/login", "/register"];
  const shouldHideSidebar = hideSidebarRoutes.includes(pathName);

  return (
    <div className="flex min-h-screen w-full">
      {!shouldHideSidebar && <Sidebar />}
      <main className="flex-1 ">
        {children}
      </main>
    </div>
  );
}
