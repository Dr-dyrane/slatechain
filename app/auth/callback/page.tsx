// app/auth/callback/page.ts

"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setTokens } from "@/lib/slices/authSlice"
import { fetchUser } from "@/lib/slices/authSlice"
import { useAppDispatch } from "@/lib/store"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")

    if (accessToken && refreshToken) {
      // Store tokens
      dispatch(setTokens({ accessToken, refreshToken }))

     // Fetch user data
     dispatch(fetchUser())
    //  .unwrap() // Ensure proper error handling
    //  .then(() => {
    //    router.push("/dashboard")
    //  })
     .catch(() => {
       router.replace("/login?error=fetch_failed")
     })
    } else {
      router.replace("/login?error=auth_failed")
    }
  }, [searchParams, dispatch, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="text-muted-foreground">Completing login...</p>
      </div>
    </div>
  )
}

