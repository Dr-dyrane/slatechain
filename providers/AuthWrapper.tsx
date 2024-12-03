"use client"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usePathname, useRouter } from 'next/navigation'
import { RootState } from '@/lib/store'
import LayoutLoader from "@/components/layout/loading";
import { sidebarItems } from '@/components/layout'
import { resumeOnboarding } from '@/lib/slices/onboardingSlice'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
    const onboardingCompleted = useSelector((state: RootState) => state.onboarding.completed)
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)
    const dispatch = useDispatch()
    const onboardingState = useSelector((state: RootState) => state.onboarding)

    useEffect(() => {
        const checkAuth = async () => {
            setIsChecking(true)

            if (isAuthenticated) {
                if (!onboardingState.completed && !onboardingState.cancelled && pathname !== '/onboarding') {
                    router.push('/onboarding')
                } else if (onboardingState.completed && (pathname === '/login' || pathname === '/register' || pathname === '/' || pathname === '/onboarding')) {
                    router.push('/dashboard')
                } else if (onboardingState.cancelled && pathname === '/onboarding') {
                    dispatch(resumeOnboarding())
                }
            } else if (!isAuthenticated && (sidebarItems.some(item => pathname.startsWith(item.href)) || pathname === '/onboarding')) {
                router.push("/login");
            }
            setIsChecking(false)
        }

        checkAuth()
    }, [isAuthenticated, onboardingCompleted, pathname, router, dispatch])

    if (isChecking) {
        return <LayoutLoader />
    }

    return <>{children}</>
}

