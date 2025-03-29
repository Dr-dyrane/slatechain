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
    Coins,
    History,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBlockchainData, type MockBlockchainData } from "@/lib/blockchain/web3Provider"

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
    const [blockchainData, setBlockchainData] = useState<MockBlockchainData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")

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
            loadBlockchainData()
        }
    }, [wallet?.address])

    const loadBlockchainData = async () => {
        if (!wallet?.address) return

        setIsLoading(true)
        try {
            const data = await getBlockchainData(wallet)
            setBlockchainData(data)
        } catch (error) {
            console.error("Error loading blockchain data:", error)
            toast.error("Failed to load blockchain data")
        } finally {
            setIsLoading(false)
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
        setBlockchainData(null)
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
        loadBlockchainData()
        toast.success("Refreshing blockchain data")
    }

    const viewOnExplorer = () => {
        if (!wallet?.address) return

        // This would be replaced with actual blockchain explorer URL based on the chain
        const explorerUrl =
            wallet.chainId === 1
                ? `https://etherscan.io/address/${wallet.address}`
                : wallet.chainId === 137
                    ? `https://polygonscan.com/address/${wallet.address}`
                    : `https://etherscan.io/address/${wallet.address}`

        window.open(explorerUrl, "_blank")
    }

    const getChainName = (chainId: number) => {
        switch (chainId) {
            case 1:
                return "Ethereum Mainnet"
            case 5:
                return "Goerli Testnet"
            case 11155111:
                return "Sepolia Testnet"
            case 137:
                return "Polygon Mainnet"
            case 80001:
                return "Mumbai Testnet"
            default:
                return `Chain ID: ${chainId}`
        }
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
                            <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
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
                                <Image src="/icons/ethereum.svg" alt="Ethereum" width={48} height={48} className="h-12 w-12" />
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
                                        <Wallet className="mr-2 h-4 w-4" />
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
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-24" />
                                    ) : (
                                        <p className="text-2xl font-bold">{blockchainData?.balance || "0.00 ETH"}</p>
                                    )}
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium mb-2">Network</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{wallet.type || "MetaMask"}</Badge>
                                        <Badge variant="outline">{getChainName(wallet.chainId)}</Badge>
                                    </div>
                                </div>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid grid-cols-3 mb-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Coins className="h-4 w-4 text-primary" />
                                                <h3 className="text-sm font-medium">Token Summary</h3>
                                            </div>
                                            {isLoading ? (
                                                <div className="space-y-2">
                                                    <Skeleton className="h-6 w-full" />
                                                    <Skeleton className="h-6 w-full" />
                                                </div>
                                            ) : blockchainData?.tokens && blockchainData.tokens.length > 0 ? (
                                                <div className="space-y-2">
                                                    {blockchainData.tokens.slice(0, 3).map((token, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <span className="text-xs font-medium">{token.symbol.charAt(0)}</span>
                                                                </div>
                                                                <span className="text-sm">{token.symbol}</span>
                                                            </div>
                                                            <span className="text-sm font-medium">{token.balance}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No tokens found</p>
                                            )}
                                        </div>

                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <History className="h-4 w-4 text-primary" />
                                                <h3 className="text-sm font-medium">Recent Activity</h3>
                                            </div>
                                            {isLoading ? (
                                                <div className="space-y-2">
                                                    <Skeleton className="h-6 w-full" />
                                                    <Skeleton className="h-6 w-full" />
                                                </div>
                                            ) : blockchainData?.transactions && blockchainData.transactions.length > 0 ? (
                                                <div className="space-y-2">
                                                    {blockchainData.transactions.slice(0, 2).map((tx, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span className="text-sm">{tx.type}</span>
                                                            <span className="text-sm font-medium">{tx.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No recent activity</p>
                                            )}
                                        </div>
                                    </div>

                                    {!user?.blockchain?.walletAddress && (
                                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                            <h3 className="text-sm font-medium mb-2">Link Wallet to Account</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Your wallet is connected but not linked to your account. Link it now to use for authentication
                                                and transactions.
                                            </p>
                                            <Button onClick={handleLoginWithWallet}>
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Link Wallet to Account
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="tokens">
                                    <div className="bg-muted/30 rounded-lg">
                                        <div className="p-4 border-b border-border">
                                            <h3 className="text-sm font-medium">Token Balances</h3>
                                        </div>
                                        {isLoading ? (
                                            <div className="p-4 space-y-3">
                                                {[1, 2, 3, 4].map((_, i) => (
                                                    <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                            </div>
                                        ) : blockchainData?.tokens && blockchainData.tokens.length > 0 ? (
                                            <div className="divide-y divide-border">
                                                {blockchainData.tokens.map((token, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4">
                                                        <div className="flex items-center gap-3">
                                                            {token.icon ? (
                                                                <Image
                                                                    src={token.icon || "/placeholder.svg"}
                                                                    alt={token.name}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                                    <span className="text-xs font-medium">{token.symbol.charAt(0)}</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium">{token.name}</p>
                                                                <p className="text-xs text-muted-foreground">{token.symbol}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">{token.balance}</p>
                                                            <p className="text-xs text-muted-foreground">{token.usdValue}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-muted-foreground">No tokens found in this wallet</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="transactions">
                                    <div className="bg-muted/30 rounded-lg">
                                        <div className="p-4 border-b border-border">
                                            <h3 className="text-sm font-medium">Transaction History</h3>
                                        </div>
                                        {isLoading ? (
                                            <div className="p-4 space-y-3">
                                                {[1, 2, 3, 4].map((_, i) => (
                                                    <Skeleton key={i} className="h-16 w-full" />
                                                ))}
                                            </div>
                                        ) : blockchainData?.transactions && blockchainData.transactions.length > 0 ? (
                                            <div className="divide-y divide-border">
                                                {blockchainData.transactions.map((tx, index) => (
                                                    <div key={index} className="p-4">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div>
                                                                <p className="text-sm font-medium">{tx.type}</p>
                                                                <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                                                                    {tx.id}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium">{tx.amount}</p>
                                                                <p className="text-xs text-muted-foreground">{tx.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {tx.status}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-xs"
                                                                onClick={() => window.open(`https://etherscan.io/tx/${tx.id}`, "_blank")}
                                                            >
                                                                View
                                                                <ExternalLink className="ml-1 h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-muted-foreground">No transactions found for this wallet</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
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

