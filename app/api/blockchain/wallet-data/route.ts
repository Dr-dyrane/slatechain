// app/api/blockchain/wallet-data/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleRequest } from "../../index";
import { ethers } from "ethers";

export async function GET(req: NextRequest) {
	return handleRequest(
		req,
		async (req, userId) => {
			try {
				// Get the wallet address from query parameters
				const url = new URL(req.url);
				const address = url.searchParams.get("address");

				if (!address) {
					return NextResponse.json(
						{
							code: "INVALID_INPUT",
							message: "Wallet address is required",
						},
						{ status: 400 }
					);
				}

				// Initialize provider with the RPC URL
				const provider = new ethers.JsonRpcProvider(
					process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL
				);

				// Fetch real blockchain data
				const [balanceWei, transactionCount] = await Promise.all([
					provider.getBalance(address),
					provider.getTransactionCount(address),
				]);

				// Format the balance
				const balanceEth = ethers.formatEther(balanceWei);
				const formattedBalance = `${Number.parseFloat(balanceEth).toFixed(4)} ETH`;

				// Fetch transaction history
				const transactions = await fetchTransactionHistory(address);

				// Fetch token balances
				const tokens = await fetchTokenBalances(address);

				return NextResponse.json({
					success: true,
					data: {
						wallet: {
							address,
							chainId: 1, // Ethereum mainnet
							isConnected: true,
							type: "MetaMask",
						},
						balance: formattedBalance,
						transactions,
						tokens,
						nfts: [], // NFT fetching would require another API call
					},
				});
			} catch (error) {
				console.error("Error fetching wallet data:", error);
				return NextResponse.json(
					{
						code: "SERVER_ERROR",
						message: "An unexpected error occurred. Please try again later.",
					},
					{ status: 500 }
				);
			}
		},
		"wallet_data",
		1
	);
}

// Fetch transaction history from Etherscan API
async function fetchTransactionHistory(address: string) {
	try {
		const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
		const response = await fetch(
			`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
		);

		const data = await response.json();

		if (data.status === "1") {
			// Transform Etherscan data to our format
			return data.result.slice(0, 10).map((tx: any) => ({
				id: tx.hash,
				type: tx.functionName
					? "Contract Interaction"
					: tx.from.toLowerCase() === address.toLowerCase()
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
}

// Fetch token balances from Moralis API
async function fetchTokenBalances(address: string) {
	try {
		const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
		if (!apiKey) {
			console.warn("Moralis API key not found, skipping token balance fetch");
			return [];
		}

		const response = await fetch(
			`https://deep-index.moralis.io/api/v2/${address}/erc20?chain=eth`,
			{
				headers: {
					"X-API-Key": apiKey,
				},
			}
		);

		const data = await response.json();

		if (Array.isArray(data)) {
			// Transform Moralis data to our format
			return data.map((token: any) => {
				const symbol = token.symbol.toLowerCase();
				const iconPath = `/icons/${symbol}.svg`;

				return {
					symbol: token.symbol,
					name: token.name,
					balance: (
						Number.parseInt(token.balance) /
						Math.pow(10, Number.parseInt(token.decimals))
					).toString(),
					usdValue: "N/A", // Would need price data from another API
					icon: iconPath,
				};
			});
		}

		return [];
	} catch (error) {
		console.error("Error fetching token balances:", error);
		return [];
	}
}
