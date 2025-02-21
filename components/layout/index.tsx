"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { RightBar } from "./RightBar";
import { BottomNav } from "./BottomNav";
import { Notification, UserRole } from "@/lib/types";
import { useIsTab } from "@/hooks/use-tab";
import { useIsDesk } from "@/hooks/use-desk";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { NotificationDrawer } from "../ui/NotificationDrawer";
import useMediaQuery from "@/hooks/use-media-query";

interface LayoutProps {
  children: React.ReactNode;
}

export const sidebarItems = [
  { href: "/dashboard", title: "Dashboard" },
  { href: "/inventory", title: "Inventory" },
  { href: "/orders", title: "Orders" },
  { href: "/logistics", title: "Logistics" },
  { href: "/suppliers", title: "Suppliers" },
  { href: "/users", title: "Users", role: UserRole.ADMIN },
];

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileNotificationDrawerOpen, setIsMobileNotificationDrawerOpen] = React.useState(false);
  const isTab = useIsTab();
  const isDesk = useIsDesk();
  const notifications = useSelector((state: RootState) => state.notifications.notifications) as Notification[];
  // Determine if the screen size is XL (1280px and up) and 2XL (1536px and up) based on tailwind breakpoints
  const isXLScreen = useMediaQuery("(min-width: 1280px)");
  const is2XLScreen = useMediaQuery("(min-width: 1536px)");
  const [showRightBar, setShowRightBar] = React.useState(isXLScreen);

  // Check if the current route matches one of the sidebar item hrefs
  const layoutRequired = sidebarItems.some(item => pathname.startsWith(item.href)) || pathname === "/profile" || pathname === "/settings";

  // Auto-collapse sidebar for tablets but keep visible
  React.useEffect(() => {
    if (isTab) setIsSidebarCollapsed(!isSidebarCollapsed);
    if (isDesk) setIsSidebarCollapsed(false);
  }, [isTab, isDesk]);

  // Manage the right sidebar open state based on the sidebar and screen size
  React.useEffect(() => {
    if (!is2XLScreen) {
      setShowRightBar(isSidebarCollapsed);
    } else {
      setShowRightBar(true);
    }
  }, [isSidebarCollapsed, is2XLScreen]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      {layoutRequired && <Navbar setIsMobileNotificationDrawerOpen={setIsMobileNotificationDrawerOpen} notifications={notifications as Notification[]} />}
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
        {/* Conditionally render the RightBar */}
        {layoutRequired && showRightBar && <RightBar notifications={notifications} />}
      </div>
      {/* Bottom Bar Navigation for Small Screens */}
      {layoutRequired && <BottomNav items={sidebarItems} />}

      {/* Mobile Notification Drawer */}
      <NotificationDrawer
        open={isMobileNotificationDrawerOpen}
        onOpenChange={setIsMobileNotificationDrawerOpen}
        notifications={notifications}
      />
    </div>
  );
}