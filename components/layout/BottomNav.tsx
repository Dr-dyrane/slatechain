"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, BarChart2, ShoppingCart, Truck, Users, Settings, UserCog } from "lucide-react";
import { UserRole } from "@/lib/types";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/inventory": BarChart2,
  "/orders": ShoppingCart,
  "/logistics": Truck,
  "/suppliers": Users,
  "/settings": Settings,
  "/users": UserCog,
};

interface SidebarProps {
  items: {
    href: string;
    title: string;
    role?: UserRole
  }[];
}

export function BottomNav({ items }: SidebarProps) {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  const filteredItems = items.filter(item => {
    return !item.role || user?.role === item.role;
  })

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
      <ul className="flex justify-around items-center h-16">
        {filteredItems.map((item) => {
          const Icon = icons[item.href] || Home; // Fallback to Home
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full text-xs",
                  isActive
                    ? ""
                    : "text-muted-foreground hover:text-secondary-foreground"

                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "fill-current" : "fill-none text-muted-foreground"
                  )} />
                {/* <span>{item.title}</span> */}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
