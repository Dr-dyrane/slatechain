"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, BarChart2, ShoppingCart, Truck, Users, Settings, PanelRightOpen, PanelRightClose } from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": Home,
  "/inventory": BarChart2,
  "/orders": ShoppingCart,
  "/logistics": Truck,
  "/suppliers": Users,
  "/settings": Settings,
};

interface SidebarProps {
  items: {
    href: string;
    title: string;
  }[];
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ items, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="h-full bg-background flex flex-col justify-between">
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = icons[item.href] || Home;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start p-4 mb-4",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "fill-current" : "fill-none", isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pb-4 px-3">
        <Button
          variant="ghost"
          className="w-full justify-center p-4"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
          {!isCollapsed && <span className="ml-3 text-left flex-1">Toggle Sidebar</span>}
        </Button>
      </div>
    </div>
  );
}
