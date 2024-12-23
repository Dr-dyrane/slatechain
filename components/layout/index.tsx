"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { RightBar } from "./RightBar";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: React.ReactNode;
}

export const sidebarItems = [
  { href: "/dashboard", title: "Dashboard" },
  { href: "/inventory", title: "Inventory" },
  { href: "/orders", title: "Orders" },
  { href: "/logistics", title: "Logistics" },
  { href: "/suppliers", title: "Suppliers" },
  // { href: "/settings", title: "Settings" },
];

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Check if the current route matches one of the sidebar item hrefs
  // we need to create and array for the sidebar items we dot want to pass down to the bottom nav and sidebar
  const layoutRequired = sidebarItems.some(item => pathname.startsWith(item.href)) || pathname === "/profile" || pathname === "/settings";

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      {layoutRequired && <Navbar />}
      <div className="flex flex-1 overflow-hidden">
        {layoutRequired && (
          <aside className={`hidden md:block transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-20" : "w-64"
            }`}>
            <Sidebar
              items={sidebarItems}
              isCollapsed={isSidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
          </aside>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main
            className={`flex-1 border bg-secondary/35 overflow-scroll ${layoutRequired ? "md:rounded-2xl p-6 pb-20 md:pb-6" : "p-0"
              }`}
          >
            {children}
          </main>
        </div>
        {/* Only render RightBar if not on the excluded routes */}
        {layoutRequired && <RightBar />}
      </div>
      {/* Only render Footer and BottomNav if not on the excluded routes */}
      {layoutRequired && <Footer />}
      {layoutRequired && <BottomNav items={sidebarItems} />}
    </div>
  );
}

