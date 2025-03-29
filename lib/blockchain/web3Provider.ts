// lib/blockchain/web3Provider.ts

import { ethers } from "ethers";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient/[...live]";

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
	type?: string;
}

export interface MockTransaction {
	id: string;
	type: string;
	amount: string;
	date: string;
	status: string;
	to?: string;
	from?: string;
	gasUsed?: string;
}

export interface MockTokenBalance {
	symbol: string;
	name: string;
	balance: string;
	usdValue?: string;
	icon?: string;
}

export interface MockBlockchainData {
	wallet: WalletInfo;
	balance: string;
	transactions: MockTransaction[];
	tokens: MockTokenBalance[];
	nfts: any[];
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
			type: "MetaMask",
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
			type: "MetaMask",
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

// Fetch wallet balance
export const fetchWalletBalance = async (
	walletAddress: string
): Promise<string> => {
	try {
		// Check if we're in demo mode by checking if apiClient is in live mode
		const isLive = apiClient.getLiveMode();

		if (!isLive) {
			// In demo mode, return mock data from API
			try {
				const response = await apiClient.get<{
					success: boolean;
					data: MockBlockchainData;
				}>(`/blockchain/wallet-data?address=${walletAddress}`);
				return response.data.balance;
			} catch (error) {
				console.error("Error fetching mock wallet balance:", error);
				return "0.0000 ETH";
			}
		}

		// In production mode, fetch real data from the blockchain
		const provider = new ethers.JsonRpcProvider(
			process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL
		);
		const balanceWei = await provider.getBalance(walletAddress);
		const balanceEth = ethers.formatEther(balanceWei);
		return `${Number.parseFloat(balanceEth).toFixed(4)} ETH`;
	} catch (error) {
		console.error("Error fetching wallet balance:", error);
		return "0.0000 ETH";
	}
};

// Fetch transaction history
export const fetchTransactionHistory = async (
	walletAddress: string
): Promise<MockTransaction[]> => {
	try {
		// Check if we're in demo mode by checking if apiClient is in live mode
		const isLive = apiClient.getLiveMode();

		if (!isLive) {
			// In demo mode, return mock data from API
			try {
				const response = await apiClient.get<{
					success: boolean;
					data: MockBlockchainData;
				}>(`/blockchain/wallet-data?address=${walletAddress}`);
				return response.data.transactions;
			} catch (error) {
				console.error("Error fetching mock transaction history:", error);
				return [];
			}
		}

		// In production mode, fetch real transaction history
		const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
		const response = await fetch(
			`https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
		);

		const data = await response.json();

		if (data.status === "1") {
			// Transform Etherscan data to our format
			return data.result.slice(0, 10).map((tx: any) => ({
				id: tx.hash,
				type: tx.functionName
					? "Contract Interaction"
					: tx.from.toLowerCase() === walletAddress.toLowerCase()
						? "Transfer"
						: "Receive",
				amount: `${ethers.formatEther(tx.value)} ETH`,
				date: new Date(Number.parseInt(tx.timeStamp) * 1000)
					.toISOString()
					.split("T")[0],
				status: tx.confirmations > 12 ? "Confirmed" : "Pending",
				to: tx.to,
				from: tx.from,
				gasUsed: `${ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice))} ETH`,
			}));
		}

		return [];
	} catch (error) {
		console.error("Error fetching transaction history:", error);
		return [];
	}
};

// Fetch token balances
export const fetchTokenBalances = async (
	walletAddress: string
): Promise<MockTokenBalance[]> => {
	try {
		// Check if we're in demo mode by checking if apiClient is in live mode
		const isLive = apiClient.getLiveMode();

		if (!isLive) {
			// In demo mode, return mock data from API
			try {
				const response = await apiClient.get<{
					success: boolean;
					data: MockBlockchainData;
				}>(`/blockchain/wallet-data?address=${walletAddress}`);
				return response.data.tokens;
			} catch (error) {
				console.error("Error fetching mock token balances:", error);
				return [];
			}
		}

		// In production mode, fetch real token balances
		const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
		const response = await fetch(
			`https://deep-index.moralis.io/api/v2/${walletAddress}/erc20?chain=eth`,
			{
				headers: {
					"X-API-Key": apiKey || "",
				},
			}
		);

		const data = await response.json();

		// Transform Moralis data to our format
		return data.map((token: any) => ({
			symbol: token.symbol,
			name: token.name,
			balance: (
				Number.parseInt(token.balance) /
				Math.pow(10, Number.parseInt(token.decimals))
			).toString(),
			usdValue: "N/A", // Would need price data from another API
			icon: `/icons/${token.symbol.toLowerCase()}.svg`, // Assuming you have these icons
		}));
	} catch (error) {
		console.error("Error fetching token balances:", error);
		return [];
	}
};

// Get complete blockchain data
export const getBlockchainData = async (
	walletInfo: WalletInfo
): Promise<MockBlockchainData> => {
	try {
		// Check if we're in demo mode by checking if apiClient is in live mode
		const isLive = apiClient.getLiveMode();

		if (!isLive) {
			// In demo mode, return mock data from API
			try {
				const response = await apiClient.get<{
					success: boolean;
					data: MockBlockchainData;
				}>(`/blockchain/wallet-data?address=${walletInfo.address}`);
				return response.data;
			} catch (error) {
				console.error("Error fetching mock blockchain data:", error);
				// Return empty data structure
				return {
					wallet: walletInfo,
					balance: "0.0000 ETH",
					transactions: [],
					tokens: [],
					nfts: [],
				};
			}
		}

		// In production mode, fetch all real data
		const [balance, transactions, tokens] = await Promise.all([
			fetchWalletBalance(walletInfo.address),
			fetchTransactionHistory(walletInfo.address),
			fetchTokenBalances(walletInfo.address),
		]);

		return {
			wallet: walletInfo,
			balance,
			transactions,
			tokens,
			nfts: [], // NFT fetching would require another API call
		};
	} catch (error) {
		console.error("Error fetching blockchain data:", error);
		return {
			wallet: walletInfo,
			balance: "0.0000 ETH",
			transactions: [],
			tokens: [],
			nfts: [],
		};
	}
};

// Register wallet with backend
export const registerWalletWithBackend = async (
	walletAddress: string,
	userId: string,
	signature: string,
	message: string
): Promise<boolean> => {
	try {
		const response = await apiClient.post<{ success: boolean }>(
			"/blockchain/register-wallet",
			{
				walletAddress,
				userId,
				signature,
				message,
			}
		);
		return response.success;
	} catch (error) {
		console.error("Error registering wallet with backend:", error);
		return false;
	}
};

// Verify wallet ownership
export const verifyWalletOwnership = async (
	walletAddress: string,
	signature: string,
	message: string
): Promise<boolean> => {
	try {
		// Verify the signature on-chain
		const signerAddress = ethers.verifyMessage(message, signature);
		return signerAddress.toLowerCase() === walletAddress.toLowerCase();
	} catch (error) {
		console.error("Error verifying wallet ownership:", error);
		return false;
	}
};
