// components/auth/WalletConnectButton.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { connectBlockchainWallet, disconnectWallet } from "@/lib/slices/authSlice"
import { toast } from "sonner"
import { isMetaMaskAvailable } from "@/lib/blockchain/web3Provider"

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WalletConnectButton({
  variant = "default",
  size = "default",
  className = "",
}: WalletConnectButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { wallet, isWalletConnecting } = useSelector((state: RootState) => state.auth)
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  useEffect(() => {
    setIsMetaMaskInstalled(isMetaMaskAvailable())
  }, [])

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      window.open("https://metamask.io/download/", "_blank")
      return
    }

    try {
      await dispatch(connectBlockchainWallet()).unwrap()
      toast.success("Wallet connected successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to connect wallet")
    }
  }

  const handleDisconnect = () => {
    dispatch(disconnectWallet())
    toast.success("Wallet disconnected")
  }

  if (!isMetaMaskInstalled) {
    return (
      <Button variant={variant} size={size} className={className} onClick={handleConnect}>
        <Wallet className="mr-2 h-4 w-4" />
        Install MetaMask
      </Button>
    )
  }

  if (wallet && wallet.isConnected) {
    return (
      <Button variant="outline" size={size} className={className} onClick={handleDisconnect}>
        <Wallet className="mr-2 h-4 w-4" />
        {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
      </Button>
    )
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleConnect} disabled={isWalletConnecting}>
      {isWalletConnecting ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}

