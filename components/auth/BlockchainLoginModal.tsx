// components/auth/BlockchainLoginModal.tsx

"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { loginWithWallet, registerWithWallet } from "@/lib/slices/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Mail, User } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { WalletInfo } from "@/lib/blockchain/web3Provider"

interface BlockchainLoginModalProps {
    isOpen: boolean
    onClose: () => void
    wallet: WalletInfo | null
}

export function BlockchainLoginModal({ isOpen, onClose, wallet }: BlockchainLoginModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login")
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const handleLogin = async () => {
        if (!wallet || !wallet.isConnected) {
            toast.error("Please connect your wallet first")
            return
        }

        setIsSubmitting(true)
        try {
            await dispatch(loginWithWallet()).unwrap()
            toast.success("Successfully logged in with blockchain wallet")
            onClose()
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Failed to login with wallet")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRegister = async () => {
        if (!wallet || !wallet.isConnected) {
            toast.error("Please connect your wallet first")
            return
        }

        if (!email || !firstName || !lastName) {
            toast.error("Please fill in all fields")
            return
        }

        setIsSubmitting(true)
        try {
            await dispatch(registerWithWallet({ email, firstName, lastName })).unwrap()
            toast.success("Successfully registered with blockchain wallet")
            onClose()
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Failed to register with wallet")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                aria-describedby="blockchain-authentication"
                className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle>Blockchain Authentication</DialogTitle>
                    <DialogDescription>Login or register using your blockchain wallet</DialogDescription>
                </DialogHeader>

                {wallet && wallet.isConnected ? (
                    <div className="py-4">
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-4 pt-4">
                                <p className="text-sm text-center text-muted-foreground">
                                    Login with your connected wallet address:
                                    <span className="block font-mono mt-1 text-primary">{wallet.address}</span>
                                </p>

                                <Button className="w-full" onClick={handleLogin} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Authenticating...
                                        </div>
                                    ) : (
                                        "Login with Wallet"
                                    )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="register" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-1">
                                        <Mail className="h-4 w-4 text-muted-foreground" /> Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-muted-foreground" /> First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Enter your first name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-muted-foreground" /> Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Enter your last name"
                                        required
                                    />
                                </div>

                                <Button className="w-full" onClick={handleRegister} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Registering...
                                        </div>
                                    ) : (
                                        "Register with Wallet"
                                    )}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="py-4">
                        <p className="text-center text-muted-foreground">Your wallet is not connected. Please try again.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

