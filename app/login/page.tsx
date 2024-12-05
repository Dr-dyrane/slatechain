"use client"

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AppDispatch, RootState } from '@/lib/store'
import { AuthError } from '@/lib/types'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { error, loading } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      router.push('/dashboard')
    }
  }

  const getErrorMessage = (error: AuthError | null): string => {
    if (error) {
      return `${error.code}: ${error.message}`
    }
    return ''
  }

  return (
    <div className="flex h-full items-center justify-center bg-none">
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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full justify-between">
            <Button variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

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
    </div>
  )
}

