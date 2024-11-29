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
  { href: "/settings", title: "Settings" },
];

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();  // Get the current route/pathname

  // Check if the current route matches one of the sidebar item hrefs
  const layoutRequired = sidebarItems.some(item => pathname.startsWith(item.href));

  return (
    <div className="flex min-h-screen flex-col">
      {/* Only render the Navbar, Sidebar, Footer, and BottomNav if not on the excluded routes */}
      {layoutRequired && <Navbar />}
      <div className="flex flex-1">
        {/* Only render Sidebar if not on the excluded routes */}
        {layoutRequired && (
          <aside className="hidden w-64 md:block">
            <Sidebar items={sidebarItems} />
          </aside>
        )}
        <main
          className={`flex-1 border bg-secondary/35 overflow-scroll ${layoutRequired ? "md:rounded-2xl p-6 pb-20 md:pb-6" : "p-0"
            }`}
        >
          {children}
        </main>
        {/* Only render RightBar if not on the excluded routes */}
        {layoutRequired && <RightBar />}
      </div>
      {/* Only render Footer and BottomNav if not on the excluded routes */}
      {layoutRequired && <Footer />}
      {layoutRequired && <BottomNav items={sidebarItems} />}
    </div>
  );
}
