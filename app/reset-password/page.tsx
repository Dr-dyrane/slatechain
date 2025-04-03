"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { resetUserPassword } from "@/lib/slices/authSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import LayoutLoader from "@/components/layout/loading"
import { toast } from "sonner"
import { Eye, EyeOff, Check, X, Lock, Code, ArrowRight, LinkIcon } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/Logo"
import * as Tooltip from "@radix-ui/react-tooltip"
import { Switch } from "@/components/ui/switch"

const resetPasswordSchema = z
    .object({
        code: z.string().min(6, "Code should be at least 6 characters"),
        newPassword: z
            .string()
            .min(8, "New password should be a minimum of 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmNewPassword: z.string().min(8, "Confirm new password should be a minimum of 8 characters"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "New passwords must match",
        path: ["confirmNewPassword"],
    })

type ResetFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const searchParams = useSearchParams()
    const codeFromUrl = searchParams.get("code")
    const email = searchParams.get("email")
    const { loading, error } = useSelector((state: RootState) => state.auth)
    const [resetSuccessful, setResetSuccessful] = useState(false)
    const [newPasswordVisible, setNewPasswordVisible] = useState(false)
    const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState<{
        hasUppercase: boolean
        hasLowercase: boolean
        hasNumber: boolean
        isLongEnough: boolean
    } | null>(null)
    const [passwordsMatch, setPasswordsMatch] = useState(false)
    const [useManualCode, setUseManualCode] = useState(!codeFromUrl)

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        trigger,
        setValue,
        getValues,
    } = useForm<ResetFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: {
            code: codeFromUrl || "",
        },
    })

    const newPasswordValue = watch("newPassword")
    const confirmNewPasswordValue = watch("confirmNewPassword")

    useEffect(() => {
        if (codeFromUrl && !useManualCode) {
            setValue("code", codeFromUrl)
        }
    }, [codeFromUrl, setValue, useManualCode])

    useEffect(() => {
        if (newPasswordValue) {
            setPasswordStrength(validatePasswordStrength(newPasswordValue))
            trigger("newPassword")
        }
    }, [newPasswordValue, trigger])

    useEffect(() => {
        if (confirmNewPasswordValue && newPasswordValue) {
            setPasswordsMatch(newPasswordValue === confirmNewPasswordValue)
            trigger("confirmNewPassword")
        }
    }, [confirmNewPasswordValue, newPasswordValue, trigger])

    const onSubmit = async (data: ResetFormValues) => {
        try {
            await dispatch(resetUserPassword({ code: data.code, newPassword: data.newPassword })).unwrap()
            setResetSuccessful(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: any) {
            setResetSuccessful(false)
            toast.error(err.message || "There was an error with the password reset process please try again")
        }
    }

    const toggleNewPasswordVisibility = () => {
        setNewPasswordVisible(!newPasswordVisible)
    }

    const toggleConfirmNewPasswordVisibility = () => {
        setConfirmNewPasswordVisible(!confirmNewPasswordVisible)
    }

    const toggleCodeInputMethod = () => {
        setUseManualCode(!useManualCode)
        if (!useManualCode && codeFromUrl) {
            // Switching to manual code, clear the field
            setValue("code", "")
        } else if (useManualCode && codeFromUrl) {
            // Switching to URL code
            setValue("code", codeFromUrl)
        }
    }

    const validatePasswordStrength = (password: string) => {
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const isLongEnough = password.length >= 8
        return { hasUppercase, hasLowercase, hasNumber, isLongEnough }
    }

    if (loading) {
        return <LayoutLoader />
    }

    if (resetSuccessful) {
        return (
            <div className="flex h-full items-center justify-center bg-none">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Password Reset Successful</CardTitle>
                        <CardDescription>
                            Your password has been reset successfully, you will be redirected to login page in 3 seconds
                        </CardDescription>
                    </CardHeader>
                    <CardContent></CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-auto min-h-screen p-8 items-center justify-center bg-none">
            <Card className="w-[350px] relative">
                <CardHeader className="text-center">
                    <Logo />
                    <CardTitle className="text-2xl mt-2">SupplyCycles</CardTitle>
                    <CardDescription>Enter your new password to reset your account.</CardDescription>
                    <Button
                        variant="ghost"
                        size={"icon"}
                        onClick={() => router.push("/login")}
                        className="absolute top-2 rounded-full right-3"
                    >
                        <X size={16} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Code input method toggle */}
                        {codeFromUrl && (
                            <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-md">
                                <div className="flex items-center space-x-2">
                                    <Switch id="code-method" checked={useManualCode} onCheckedChange={toggleCodeInputMethod} />
                                    <Label htmlFor="code-method">Enter code manually</Label>
                                </div>
                                <Tooltip.Provider>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                                                side="top"
                                                align="center"
                                            >
                                                {useManualCode ? "Using manual code entry" : "Using code from link"}
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                            </div>
                        )}

                        {/* Code input field - only shown if using manual code or no URL code exists */}
                        {(useManualCode || !codeFromUrl) && (
                            <div className="space-y-2">
                                <Tooltip.Provider>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <Label htmlFor="code" className="flex items-center gap-1">
                                                <Code className="h-4 w-4 text-muted-foreground" /> Reset Code
                                            </Label>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                                                side="top"
                                                align="center"
                                            >
                                                Enter the 6-digit code from your email
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                                <Input
                                    id="code"
                                    placeholder="Enter your 6-digit code"
                                    {...register("code")}
                                    className="input-focus input-hover"
                                />
                                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                            </div>
                        )}

                        {/* Information message about code usage */}
                        {!useManualCode && codeFromUrl && (
                            <div className="p-3 bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-blue-300 rounded-md text-sm">
                                <p>
                                    Using secure code from your reset link. Toggle the switch above if you prefer to enter a 6-digit code
                                    manually.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Label htmlFor="newPassword" className="flex items-center gap-1">
                                            <Lock className="h-4 w-4 text-muted-foreground" /> New Password
                                        </Label>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                                            side="top"
                                            align="center"
                                        >
                                            Enter your new account password
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            </Tooltip.Provider>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={newPasswordVisible ? "text" : "password"}
                                    placeholder="New Password"
                                    {...register("newPassword")}
                                    className="input-focus input-hover pr-10"
                                    onChange={() => trigger("newPassword")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={toggleNewPasswordVisibility}
                                >
                                    {newPasswordVisible ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {passwordStrength && (
                                <div className="space-y-1 mt-3 bg-muted p-2 rounded-md">
                                    <p className={`text-sm ${passwordStrength.isLongEnough ? "text-green-500" : "text-red-500"}`}>
                                        {passwordStrength.isLongEnough ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                        At least 8 characters
                                    </p>
                                    <p className={`text-sm ${passwordStrength.hasUppercase ? "text-green-500" : "text-red-500"}`}>
                                        {passwordStrength.hasUppercase ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                        Contains uppercase letter
                                    </p>
                                    <p className={`text-sm ${passwordStrength.hasLowercase ? "text-green-500" : "text-red-500"}`}>
                                        {passwordStrength.hasLowercase ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                        Contains lowercase letter
                                    </p>
                                    <p className={`text-sm ${passwordStrength.hasNumber ? "text-green-500" : "text-red-500"}`}>
                                        {passwordStrength.hasNumber ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                                        Contains number
                                    </p>
                                </div>
                            )}
                            {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <Label htmlFor="confirmNewPassword" className="flex items-center gap-1">
                                            <Lock className="h-4 w-4 text-muted-foreground" /> Confirm New Password
                                        </Label>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
                                            side="top"
                                            align="center"
                                        >
                                            Confirm your new password
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            </Tooltip.Provider>
                            <div className="relative">
                                <Input
                                    id="confirmNewPassword"
                                    type={confirmNewPasswordVisible ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    {...register("confirmNewPassword")}
                                    className="input-focus input-hover pr-10"
                                    onChange={() => trigger("confirmNewPassword")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={toggleConfirmNewPasswordVisibility}
                                >
                                    {confirmNewPasswordVisible ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.confirmNewPassword && <p className="text-sm text-red-500">{errors.confirmNewPassword.message}</p>}
                            {newPasswordValue && confirmNewPasswordValue && passwordsMatch && (
                                <p className="text-sm text-green-500 flex items-center">
                                    <Check className="inline mr-1" />
                                    Passwords match
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="mt-4 w-full flex items-center justify-center gap-2"
                            disabled={loading || !isValid}
                        >
                            {loading ? "Resetting..." : "Reset Password"} <ArrowRight size={16} />
                        </Button>
                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertDescription>{error.message}</AlertDescription>
                            </Alert>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex flex-row gap-4 items-center justify-end">
                    <div className="text-sm text-center">
                        Don't have a chain?{" "}
                        <Link href="/register" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

