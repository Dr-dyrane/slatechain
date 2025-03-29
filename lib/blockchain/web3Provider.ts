// lib/blockchain/web3Provider.ts

import { ethers } from "ethers";
import { toast } from "sonner";

// Types

declare global {
	interface Window {
		ethereum?: any;
	}
}

export interface WalletInfo {
	address: string;
	chainId: number;
	isConnected: boolean;
}

// Check if window.ethereum is available
export const isMetaMaskAvailable = (): boolean => {
	return typeof window !== "undefined" && window.ethereum !== undefined;
};

// Get provider
export const getProvider = (): ethers.BrowserProvider | null => {
	if (!isMetaMaskAvailable()) return null;
	return new ethers.BrowserProvider(window.ethereum);
};

// Connect wallet
export const connectWallet = async (): Promise<WalletInfo | null> => {
	try {
		if (!isMetaMaskAvailable()) {
			toast.error(
				"MetaMask is not installed. Please install MetaMask to continue."
			);
			return null;
		}

		const provider = getProvider();
		if (!provider) return null;

		// Request account access
		const accounts = await provider.send("eth_requestAccounts", []);

		if (accounts.length === 0) {
			toast.error("No accounts found. Please create an account in MetaMask.");
			return null;
		}

		const address = accounts[0];
		const network = await provider.getNetwork();
		const chainId = Number(network.chainId);

		return {
			address,
			chainId,
			isConnected: true,
		};
	} catch (error: any) {
		console.error("Error connecting wallet:", error);
		toast.error(error.message || "Failed to connect wallet");
		return null;
	}
};

// Get current wallet
export const getCurrentWallet = async (): Promise<WalletInfo | null> => {
	try {
		if (!isMetaMaskAvailable()) return null;

		const provider = getProvider();
		if (!provider) return null;

		const accounts = await provider.send("eth_accounts", []);

		if (accounts.length === 0) {
			return null;
		}

		const address = accounts[0];
		const network = await provider.getNetwork();
		const chainId = Number(network.chainId);

		return {
			address,
			chainId,
			isConnected: true,
		};
	} catch (error) {
		console.error("Error getting current wallet:", error);
		return null;
	}
};

// Sign message for authentication
export const signMessage = async (message: string): Promise<string | null> => {
	try {
		if (!isMetaMaskAvailable()) {
			toast.error("MetaMask is not installed");
			return null;
		}

		const provider = getProvider();
		if (!provider) return null;

		const signer = await provider.getSigner();
		const signature = await signer.signMessage(message);

		return signature;
	} catch (error: any) {
		console.error("Error signing message:", error);
		toast.error(error.message || "Failed to sign message");
		return null;
	}
};
