"use client"

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { usePathname, useRouter } from 'next/navigation'
import { RootState } from '@/lib/store'
import LayoutLoader from "@/components/layout/loading";
import { sidebarItems } from '@/components/layout'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            setIsChecking(true)

            if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
                router.push('/dashboard')
            }

            // If user is unauthenticated and trying to access protected routes like /dashboard, /inventory, etc.
            else if (!isAuthenticated && sidebarItems.some(item => pathname.startsWith(item.href))) {
                router.push("/login");
            }
            setIsChecking(false)
        }

        checkAuth()
    }, [isAuthenticated, pathname, router])

    if (isChecking) {
        return <LayoutLoader />
    }

    return <>{children}</>
}

