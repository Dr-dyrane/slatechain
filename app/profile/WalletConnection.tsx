"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { connectBlockchainWallet, disconnectWallet, loginWithWallet, registerWithWallet } from "@/lib/slices/authSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Wallet,
    LinkIcon as LinkBreak,
    ArrowRight,
    Check,
    AlertCircle,
    Copy,
    RefreshCw,
    ShieldCheck,
    ExternalLink,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Image from "next/image"

const registerSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function WalletConnection() {
    const dispatch = useDispatch<AppDispatch>()
    const { wallet, isWalletConnecting, error, user } = useSelector((state: RootState) => state.auth)
    const [copied, setCopied] = useState(false)
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
    const [walletBalance, setWalletBalance] = useState<string | null>(null)
    const [isLoadingBalance, setIsLoadingBalance] = useState(false)
    const [transactionHistory, setTransactionHistory] = useState<any[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
        },
    })

    useEffect(() => {
        if (wallet?.address) {
            fetchWalletBalance()
            fetchTransactionHistory()
        }
    }, [wallet?.address])

    const fetchWalletBalance = async () => {
        if (!wallet?.address) return

        setIsLoadingBalance(true)
        try {
            // This would be replaced with actual blockchain API call
            // For demo purposes, we're simulating a balance fetch
            setTimeout(() => {
                setWalletBalance("0.0425 ETH")
                setIsLoadingBalance(false)
            }, 1000)
        } catch (error) {
            console.error("Error fetching wallet balance:", error)
            setIsLoadingBalance(false)
        }
    }

    const fetchTransactionHistory = async () => {
        if (!wallet?.address) return

        setIsLoadingHistory(true)
        try {
            // This would be replaced with actual blockchain API call
            // For demo purposes, we're simulating transaction history
            setTimeout(() => {
                setTransactionHistory([
                    {
                        id: "0x1a2b3c...",
                        type: "Transfer",
                        amount: "0.01 ETH",
                        date: "2023-03-15",
                        status: "Confirmed",
                    },
                    {
                        id: "0x4d5e6f...",
                        type: "Contract Interaction",
                        amount: "0.005 ETH",
                        date: "2023-03-10",
                        status: "Confirmed",
                    },
                ])
                setIsLoadingHistory(false)
            }, 1500)
        } catch (error) {
            console.error("Error fetching transaction history:", error)
            setIsLoadingHistory(false)
        }
    }

    const handleConnectWallet = async () => {
        try {
            await dispatch(connectBlockchainWallet()).unwrap()
            toast.success("Wallet connected successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to connect wallet")
        }
    }

    const handleDisconnectWallet = () => {
        dispatch(disconnectWallet())
        toast.success("Wallet disconnected")
    }

    const handleLoginWithWallet = async () => {
        try {
            await dispatch(loginWithWallet()).unwrap()
            toast.success("Successfully authenticated with wallet")
        } catch (error: any) {
            if (error.message?.includes("Wallet not registered")) {
                setIsRegisterDialogOpen(true)
            } else {
                toast.error(error.message || "Failed to authenticate with wallet")
            }
        }
    }

    const onRegisterSubmit = async (data: RegisterFormValues) => {
        try {
            await dispatch(registerWithWallet(data)).unwrap()
            toast.success("Successfully registered with wallet")
            setIsRegisterDialogOpen(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to register with wallet")
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success("Address copied to clipboard")
    }

    const truncateAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    const refreshData = () => {
        fetchWalletBalance()
        fetchTransactionHistory()
        toast.success("Refreshing blockchain data")
    }

    const viewOnExplorer = () => {
        if (!wallet?.address) return

        // This would be replaced with actual blockchain explorer URL
        window.open(`https://etherscan.io/address/${wallet.address}`, "_blank")
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-semibold">Blockchain Wallet</CardTitle>
                            <CardDescription>
                                Connect your blockchain wallet to use for authentication and transactions
                            </CardDescription>
                        </div>
                        {wallet && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={refreshData}
                                disabled={isLoadingBalance || isLoadingHistory}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoadingBalance || isLoadingHistory ? "animate-spin" : ""}`} />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {error && error.code === "WALLET_CONNECTION_ERROR" && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    )}

                    {!wallet ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="bg-muted p-6 rounded-full">
                                <Image
                                    src="/icons/etherium.svg"
                                    alt="Ethereum"
                                    width={48}
                                    height={48}
                                    className="h-12 w-12"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-medium">No Wallet Connected</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Connect your blockchain wallet to use for authentication and transactions on our platform.
                                </p>
                            </div>
                            <Button onClick={handleConnectWallet} className="mt-4" disabled={isWalletConnecting}>
                                {isWalletConnecting ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Connect Wallet
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Wallet className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Connected Wallet</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground">{truncateAddress(wallet.address)}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(wallet.address)}
                                            >
                                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" onClick={viewOnExplorer} className="w-full sm:w-auto">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View on Explorer
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleDisconnectWallet} className="w-full sm:w-auto">
                                        <LinkBreak className="mr-2 h-4 w-4" />
                                        Disconnect
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium mb-2">Wallet Balance</h3>
                                    {isLoadingBalance ? (
                                        <Skeleton className="h-8 w-24" />
                                    ) : (
                                        <p className="text-2xl font-bold">{walletBalance || "0.00 ETH"}</p>
                                    )}
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium mb-2">Wallet Type</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{wallet.type || "MetaMask"}</Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
                                        >
                                            <ShieldCheck className="mr-1 h-3 w-3" />
                                            Verified
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
                                {isLoadingHistory ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : transactionHistory.length > 0 ? (
                                    <div className="space-y-2">
                                        {transactionHistory.map((tx, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium">{tx.type}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{tx.amount}</p>
                                                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-muted/30 rounded-lg">
                                        <p className="text-sm text-muted-foreground">No transactions found</p>
                                    </div>
                                )}
                            </div>

                            {!user?.blockchain?.walletAddress && (
                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                    <h3 className="text-sm font-medium mb-2">Link Wallet to Account</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Your wallet is connected but not linked to your account. Link it now to use for authentication and
                                        transactions.
                                    </p>
                                    <Button onClick={handleLoginWithWallet}>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Link Wallet to Account
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                {wallet && (
                    <CardFooter className="bg-muted/50 flex flex-col items-start px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                            Your wallet is securely connected. We never store your private keys.
                        </p>
                    </CardFooter>
                )}
            </Card>

            <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register with Wallet</DialogTitle>
                        <DialogDescription>
                            Your wallet is not registered. Please provide the following information to create an account.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your.email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Register
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

