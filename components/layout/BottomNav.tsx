"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getSidebarItemMeta } from "@/lib/utils";
import { Home, BarChart2, ShoppingCart, Truck, Users, Settings, UserCog, User } from "lucide-react";
import { UserRole } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useNavState } from "@/hooks/use-nav-state";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/inventory": BarChart2,
  "/orders": ShoppingCart,
  "/logistics": Truck,
  "/suppliers": Users,
  "/settings": Settings,
  "/users": UserCog,
  "/profile": User,
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
  const navState = useNavState();

  // const filteredItems = items.filter(item => {
  //   return !item.role || user?.role === item.role;
  // })

  return (
    <nav className="w-full md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
      <ul className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const Icon = icons[item.href] || Home; // Fallback to Home
          const isActive = pathname === item.href;
          const meta = getSidebarItemMeta(navState, item.href)

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
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-center relative",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 hover:fill-current",
                      isActive ? "fill-current" : "fill-none text-muted-foreground"
                    )} />
                  {/* <span>{item.title}</span> */}

                  {/* Badge */}
                  {meta.badge && (
                    <Badge
                      variant={meta.badge.variant}
                      className="flex absolute -right-2 -top-2 text-[8px] py-0 px-1 justify-center items-center leading-none w-[22px] h-[22px] aspect-square border-2 border-background"
                    >
                      {meta.badge.count}
                    </Badge>
                  )}
                </Button>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
