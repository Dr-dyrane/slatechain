"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getSidebarItemMeta } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, BarChart2, ShoppingCart, Truck, Users, Settings, PanelRightOpen, PanelRightClose, UserCog, LayoutGrid } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { UserRole } from "@/lib/types";
import Image from "next/image";
import { Badge } from "../ui/badge";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": Home,
  "/inventory": BarChart2,
  "/orders": ShoppingCart,
  "/logistics": Truck,
  "/suppliers": Users,
  "/settings": Settings,
  "/users": UserCog,
  "/apps": LayoutGrid,
};

interface SidebarProps {
  items: {
    href: string;
    title: string;
    role?: UserRole
  }[];
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ items, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const state = useSelector((state: RootState) => state)
  // const user = state.auth.user

  // const filteredItems = items.filter(item => {
  //   return !item.role || user?.role === item.role;
  // })

  return (
    <div className="h-full bg-background flex flex-col justify-between">
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = icons[item.href] || Home;
            const isActive = pathname === item.href;
            const meta = getSidebarItemMeta(state, item.href)

            return (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start p-4 mb-4 relative",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", isActive ? "fill-current" : "fill-none",
                      isCollapsed ? "mr-0" : "mr-3")}
                  />
                  {!isCollapsed && <span className="flex-1 text-left">{item.title}</span>}

                  {/* Service Icon */}
                  {meta.serviceIcon && !isCollapsed && (
                    <div className="relative bg-muted/35 w-8 h-8 rounded-full overflow-clip">
                      <Image
                        src={meta.serviceIcon.src || "/placeholder.svg"}
                        alt={meta.serviceIcon.alt}
                        fill
                        className="object-cover h-8 w-8 p-1"
                      />
                    </div>
                  )}

                  {/* Badge */}
                  {meta.badge && (
                    <Badge
                      variant={meta.badge.variant}
                      className={cn("ml-auto flex items-center text-xs justify-center leading-none aspect-square w-6 h-6", isCollapsed && "absolute -right-2 -top-2 text-[8px] p-2 py-0 border-2 border-background w-[22px] h-[22px]", !isCollapsed && "ml-2")}
                    >
                      {meta.badge.count}
                    </Badge>
                  )}
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
