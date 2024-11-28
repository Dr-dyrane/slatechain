// hooks/useProtectedRoute.ts
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { useRouter } from 'next/navigation'


const useProtectedRoute = () => {
  const router = useRouter()

  // Get authentication status from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      router.push('/login')  // Redirect to login
    }
  }, [isAuthenticated, router])

  // Optionally, you can return a loading indicator if needed
  return null
}

export default useProtectedRoute
