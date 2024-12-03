"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/lib/store";
import LayoutLoader from "@/components/layout/loading";
import { resumeOnboarding, resetOnboarding } from "@/lib/slices/onboardingSlice";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const authUserId = useSelector((state: RootState) => state.auth.user?.id);
    const onboardingUserId = useSelector((state: RootState) => state.onboarding.userId);
    const onboardingState = useSelector((state: RootState) => state.onboarding);

    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            setIsChecking(true);

            if (isAuthenticated) {
                // Reset onboarding state if user IDs don't match
                if (onboardingUserId && onboardingUserId !== authUserId) {
                    dispatch(resetOnboarding());
                }

                if (!onboardingState.completed && !onboardingState.cancelled && pathname !== "/onboarding") {
                    router.push("/onboarding");
                } else if (onboardingState.completed && ["/login", "/register", "/", "/onboarding"].includes(pathname)) {
                    router.push("/dashboard");
                } else if (onboardingState.cancelled && pathname === "/onboarding") {
                    dispatch(resumeOnboarding());
                }
            } else if (!isAuthenticated && (pathname.startsWith("/dashboard") || pathname === "/onboarding")) {
                router.push("/login");
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [isAuthenticated, authUserId, onboardingUserId, pathname, router, onboardingState, dispatch]);

    if (isChecking) {
        return <LayoutLoader />;
    }

    return <>{children}</>;
}
