"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
    href: string;
    title: string;
  }[];
}

export function BottomNav({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
      <ul className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = icons[item.href] || Home; // Fallback to Home

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full text-xs",
                  pathname === item.href
                    ? ""
                    : "text-muted-foreground hover:text-secondary-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                {/* <span>{item.title}</span> */}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
