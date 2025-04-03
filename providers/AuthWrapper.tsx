// src/providers/AuthWrapper.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/lib/store";
import LayoutLoader from "@/components/layout/loading";
import { initializeApp } from "@/lib/helpers/appInitializer";
import { UserRole } from "@/lib/types";
import { restrictedPages } from "@/lib/config/getRestrictedPages";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const role = user?.role;

    const [isChecking, setIsChecking] = useState(true);
    const isInitialized = useRef(false); // Track whether initialization has been done

    useEffect(() => {
        // Ensure initialization is only performed once
        if (isAuthenticated && !isInitialized.current) {
            initializeApp(dispatch, role as UserRole);
            isInitialized.current = true; // Mark as initialized
        }
    }, [isAuthenticated]);

    const hasPrefetched = useRef(false); // Track prefetching status

    // Preload all pages on first load
    useEffect(() => {
        if (!hasPrefetched.current) {
            setIsChecking(true);
            const settingsSubpages = [
                "help-support",
                "help-support/schedule",
            ];

            const pages = [
                "/",           // Home
                "/dashboard",  // Dashboard
                "/inventory",  // Inventory
                "/orders",     // Orders
                "/logistics",  // Logistics
                "/suppliers",  // Suppliers
                "/users",      // Users
                "/profile",    // Profile
                "/settings",   // Settings root
                "/apps",       // Apps
                ...settingsSubpages.map((subpage) => `/settings/${subpage}`),
            ];

            Promise.all(pages.map((page) => fetch(page))).catch((err) => {
                console.error("Page prefetching failed", err);
            });

            hasPrefetched.current = true;
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        const handleRouting = () => {
            setIsChecking(true);

            const publicPages = [
                "/", "/login", "/register", "/reset-password", "/pricing",
                "/policy", "/terms", "/contact", "/about", "/faq",
                "/features", "/blog", "/blog/[slug]"
            ];
            const isPublicPage = publicPages.includes(pathname);

            // If the user is authenticated but trying to access a restricted page
            if (isAuthenticated && restrictedPages[role as UserRole]?.includes(pathname)) {
                // Redirect to the dashboard if the page is restricted
                router.push("/dashboard");
            }
            // If the user is not authenticated but trying to access a non-public page
            else if (!isAuthenticated && !isPublicPage) {
                router.push("/login");
            }
            // If authenticated and trying to access a public page, redirect to dashboard
            else if (isAuthenticated && isPublicPage) {
                router.push("/dashboard");
            }

            setIsChecking(false);
        };

        handleRouting();
    }, [isAuthenticated, pathname, router]);

    if (isChecking) {
        return <LayoutLoader />;
    }

    return <>{children}</>;
}
