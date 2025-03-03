// src/components/layout/authWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/lib/store";
import LayoutLoader from "@/components/layout/loading";
import { initializeApp } from "@/lib/helpers/appInitializer"; // Import the helper
import { UserRole } from "@/lib/types";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const role = user?.role;

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            initializeApp(dispatch, role as UserRole);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleRouting = () => {
            setIsChecking(true);

            const publicPages = ["/", "/login", "/register", '/reset-password', '/pricing', '/policy', '/terms', '/contact', '/about', '/faq', '/features', '/blog', '/blog/[slug]'];
            const isPublicPage = publicPages.includes(pathname);

            if ((isAuthenticated) && isPublicPage) {
                router.push("/dashboard");
            } else if (!isAuthenticated && !isPublicPage) {
                router.push("/login");
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