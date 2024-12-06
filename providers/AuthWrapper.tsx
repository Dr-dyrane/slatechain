"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { RootState, AppDispatch } from "@/lib/store";
import LayoutLoader from "@/components/layout/loading";
import { setUser } from "@/lib/slices/authSlice";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const { data: session, status } = useSession();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (status === "authenticated" && session.user) {
            dispatch(setUser(session.user as any));
        }
    }, [status, session, dispatch]);

    useEffect(() => {
        const handleRouting = () => {
            setIsChecking(true);

            const publicPages = ["/", "/login", "/register"];
            const isPublicPage = publicPages.includes(pathname);

            if ((isAuthenticated || status === "authenticated") && isPublicPage) {
                router.push("/dashboard");
            } else if (!isAuthenticated && status !== "authenticated" && !isPublicPage) {
                router.push("/login");
            }

            setIsChecking(false);
        };

        handleRouting();
    }, [isAuthenticated, status, pathname, router]);

    if (isChecking || status === "loading") {
        return <LayoutLoader />;
    }

    return <>{children}</>;
}

