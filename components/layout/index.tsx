"use client";

import * as React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { RightBar } from "./RightBar";
import { BottomNav } from "./BottomNav";
import useProtectedRoute from "@/hooks/useProtectedRoute";

interface LayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { href: "/", title: "Dashboard" },
  { href: "/inventory", title: "Inventory" },
  { href: "/orders", title: "Orders" },
  { href: "/logistics", title: "Logistics" },
  { href: "/suppliers", title: "Suppliers" },
  { href: "/settings", title: "Settings" },
];

export function Layout({ children }: LayoutProps) {
  useProtectedRoute()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden w-64 md:block">
          <Sidebar items={sidebarItems} />
        </aside>
        <main className="flex-1 border bg-secondary/35 md:rounded-2xl overflow-y-auto p-6 pb-20 md:pb-6">{children}</main>
        <RightBar />
      </div>
      <Footer />
      <BottomNav items={sidebarItems}/>
    </div>
  );
}
