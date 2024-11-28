"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, BarChart2, ShoppingCart, Truck, Users, Settings } from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/inventory": BarChart2,
  "/orders": ShoppingCart,
  "/logistics": Truck,
  "/suppliers": Users,
  "/settings": Settings,
};

interface SidebarProps {
  items: {
    href: string; // Allow any string
    title: string;
  }[];
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="h-full bg-background">
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = icons[item.href] || Home; // Fallback to Home
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start px-4 py-2 mb-2"
                >
                  <Icon className={cn("mr-3 h-5 w-5", isActive ? "fill-current" : "fill-none"
                  )} />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
