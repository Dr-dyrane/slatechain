// src/app/login/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AppDispatch, RootState } from '@/lib/store'
import { login, googleLogin, resetLoading, sendResetEmail } from '@/lib/slices/authSlice'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [showForgotPassowrd, setShowForgotPassowrd] = useState(false);
  const { error, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    return () => {
      dispatch(resetLoading());
    };
  }, [dispatch]);

  const handleForgotPassword = async () => {
    setShowForgotPassowrd(true)
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      router.push('/dashboard')
    }
  }
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleGoogleSignIn = () => {
    dispatch(googleLogin())
  }

  return (
    <div className="flex  h-auto min-h-screen p-8 items-center justify-center bg-none">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl mt-2">SlateChain</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full">
            <Button variant='link' size={'sm'} onClick={handleForgotPassword}>Forgot password?</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          <GoogleSignInButton onClick={handleGoogleSignIn} className="w-full">
            Sign in with Google
          </GoogleSignInButton>
          <div className="text-sm text-center">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link href="/" className="text-muted-foreground hover:underline">
              Learn more about SlateChain
            </Link>
          </div>
        </CardFooter>
      </Card>
      <ForgotPasswordModal isOpen={showForgotPassowrd} onClose={() => setShowForgotPassowrd(false)} />
    </div>
  )
}