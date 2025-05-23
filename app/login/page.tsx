"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { AppDispatch, RootState } from "@/lib/store"
import {
  login,
  googleLogin,
  resetLoading,
  appleLogin,
  setLoading,
  connectBlockchainWallet,
} from "@/lib/slices/authSlice"
import { GoogleSignInButton } from "@/components/ui/google-sign-in-button"
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal"
import { Eye, EyeOff, Mail, Lock, LogIn, X, Phone } from "lucide-react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { toast } from "sonner"
import { AppleSignInButton } from "@/components/ui/apple-sign-in-button"
import AuthLoading from "./loading"
import { BlockchainSignInButton } from "@/components/ui/blockchain-sign-in-button"
import { BlockchainLoginModal } from "@/components/auth/BlockchainLoginModal"
import { PhoneLoginModal } from "@/components/auth/PhoneLoginModal"
import { TwoFactorVerifyModal } from "@/components/auth/TwoFactorVerifyModal"

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [showForgotPassowrd, setShowForgotPassowrd] = useState(false)
  const [showPhoneLogin, setShowPhoneLogin] = useState(false)
  const { error, loading, wallet, twoFactorPending } = useSelector((state: RootState) => state.auth)
  const [showBlockchainModal, setShowBlockchainModal] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(resetLoading())
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const handleForgotPassword = () => {
    setShowForgotPassowrd(true)
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setFormErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await dispatch(login({ email, password }))

      if (login.fulfilled.match(result)) {
        // Check if 2FA is required
        if ("requireTwoFactor" in result.payload) {
          // 2FA required, handled by the reducer
        } else {
          // Login successful
          toast.success("Successfully logged in")
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const handleGoogleSignIn = () => {
    dispatch(googleLogin())
  }

  const handleAppleSignIn = () => {
    dispatch(appleLogin())
  }

  const handlePhoneLogin = () => {
    setShowPhoneLogin(true)
  }

  const handleBlockchainSignIn = async () => {
    try {
      // First connect the wallet
      const walletResult = await dispatch(connectBlockchainWallet()).unwrap()

      if (walletResult) {
        // If wallet is connected, open the blockchain login modal
        setShowBlockchainModal(true)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to connect wallet")
    }
  }

  const handleGoBack = () => {
    router.push("/")
  }

  //Loading and Error
  if (loading) {
    return <AuthLoading />
  }

  return (
    <div className="flex h-auto min-h-screen p-8 items-center justify-center bg-none">
      <Card className="w-[350px] relative">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl mt-2">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
          <Button variant="ghost" size={"icon"} onClick={handleGoBack} className="absolute top-2 rounded-full right-3">
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
            <div className="grid w-full items-center gap-4 space-y-2 md:space-y-4">
              <div className="flex flex-col space-y-1.5">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" /> Email
                      </Label>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                        side="top"
                        align="center"
                      >
                        Enter your registered email address
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFormErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  className={formErrors.email ? "border-destructive" : ""}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  required
                />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>

              <div className="flex flex-col space-y-1.5 md:space-y-2">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Label htmlFor="password" className="flex items-center gap-1">
                        <Lock className="h-4 w-4 text-muted-foreground" /> Password
                      </Label>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                        side="top"
                        align="center"
                      >
                        Enter your account password
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setFormErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    required
                    className={`pr-10 ${formErrors.password ? "border-destructive" : ""}`}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                    disabled={isSubmitting}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
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
          <div className="flex justify-end w-full items-center">
            <Button
              variant="link"
              size={"sm"}
              disabled={isSubmitting || loading}
              onClick={handleForgotPassword}
              className=""
            >
              Forgot password?
            </Button>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting || loading} onClick={handleSubmit}>
            {isSubmitting || loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Logging in...
              </div>
            ) : (
              <>
                Login <LogIn className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handlePhoneLogin}
            disabled={isSubmitting || loading}
          >
            <Phone className="h-4 w-4" />
            Sign in with Phone
          </Button>

          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isSubmitting || loading} className="w-full gap-2">
            Sign in with Google
          </GoogleSignInButton>

          <AppleSignInButton onClick={handleAppleSignIn} disabled={isSubmitting || loading} className="w-full gap-2">
            Sign in with Apple
          </AppleSignInButton>

          <BlockchainSignInButton
            onClick={handleBlockchainSignIn}
            disabled={isSubmitting || loading}
            className="w-full gap-2"
          >
            Sign in with Ethereum
          </BlockchainSignInButton>

          <div className="text-sm text-center">
            Don't have a chain?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
      <ForgotPasswordModal isOpen={showForgotPassowrd} onClose={() => setShowForgotPassowrd(false)} />
      <BlockchainLoginModal
        isOpen={showBlockchainModal}
        onClose={() => setShowBlockchainModal(false)}
        wallet={wallet}
      />
      <PhoneLoginModal
        isOpen={showPhoneLogin}
        onClose={() => setShowPhoneLogin(false)}
        onVerificationNeeded={() => { }}
      />
      <TwoFactorVerifyModal isOpen={twoFactorPending as boolean || false} onClose={() => { }} />
    </div>
  )
}

