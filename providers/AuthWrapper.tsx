"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/lib/store";
import LayoutLoader from "@/components/layout/loading";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    // Redux state selector
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const handleRouting = () => {
            setIsChecking(true);

            const publicPages = ["/", "/login", "/register"];
            const isPublicPage = publicPages.includes(pathname);

            if (isAuthenticated && isPublicPage) {
                // Redirect authenticated users away from public pages
                router.push("/dashboard");
            } else if (!isAuthenticated && !isPublicPage) {
                // Redirect unauthenticated users away from non-public pages
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
