// src/components/layout/authWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { RootState, AppDispatch } from "@/lib/store";
import LayoutLoader from "@/components/layout/loading";
import { setUser } from "@/lib/slices/authSlice";
import { initializeApp } from "@/lib/helpers/appInitializer"; // Import the helper

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const { data: session, status } = useSession();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    // const authState = useSelector((state: RootState) => state.auth);
    // const onboardingState = useSelector((state: RootState) => state.onboarding);
    // const inventoryState = useSelector((state: RootState) => state.inventory);
    // const kycState = useSelector((state: RootState) => state.kyc);

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (status === "authenticated" && session.user) {
            dispatch(setUser(session.user as any));
        }
    }, [status, session, dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            initializeApp(dispatch);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleRouting = () => {
            setIsChecking(true);

            const publicPages = ["/", "/login", "/register", '/reset-password'];
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