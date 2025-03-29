// lib/blockchain/authContract.ts

import { ethers } from "ethers";
import { getProvider } from "./web3Provider";

// ABI for the authentication contract
const AUTH_CONTRACT_ABI = [
	// User registration
	"function registerUser(address userAddress, string memory userId) public",
	// Check if user exists
	"function userExists(address userAddress) public view returns (bool)",
	// Get user ID
	"function getUserId(address userAddress) public view returns (string memory)",
	// Events
	"event UserRegistered(address indexed userAddress, string userId, uint256 timestamp)",
];

// Contract address
const AUTH_CONTRACT_ADDRESS =
	process.env.NEXT_PUBLIC_AUTH_CONTRACT_ADDRESS || "";

export const getAuthContract = async (): Promise<ethers.Contract | null> => {
	try {
		const provider = getProvider();
		if (!provider) return null;

		const signer = await provider.getSigner();
		return new ethers.Contract(
			AUTH_CONTRACT_ADDRESS,
			AUTH_CONTRACT_ABI,
			signer
		);
	} catch (error) {
		console.error("Failed to initialize auth contract:", error);
		return null;
	}
};

export class AuthContract {
	private contract: ethers.Contract | null = null;

	constructor() {
		this.initContract();
	}

	private async initContract() {
		try {
			const provider = getProvider();
			if (!provider) return;

			this.contract = new ethers.Contract(
				AUTH_CONTRACT_ADDRESS,
				AUTH_CONTRACT_ABI,
				provider
			);
		} catch (error) {
			console.error("Failed to initialize auth contract:", error);
		}
	}

	async registerUser(userId: string): Promise<boolean> {
		try {
			if (!this.contract) await this.initContract();
			if (!this.contract) throw new Error("Contract not initialized");

			const provider = getProvider();
			if (!provider) throw new Error("Provider not available");

			const signer = await provider.getSigner();
			const contract = await getAuthContract();
			if (contract) {
				const address = await signer.getAddress();
				const tx = await contract.registerUser(address, userId);
				await tx.wait();
			}

			return true;
		} catch (error) {
			console.error("Error registering user on blockchain:", error);
			return false;
		}
	}

	async userExists(address: string): Promise<boolean> {
		try {
			if (!this.contract) await this.initContract();
			if (!this.contract) throw new Error("Contract not initialized");

			return await this.contract.userExists(address);
		} catch (error) {
			console.error("Error checking if user exists:", error);
			return false;
		}
	}

	async getUserId(address: string): Promise<string | null> {
		try {
			if (!this.contract) await this.initContract();
			if (!this.contract) throw new Error("Contract not initialized");

			const userId = await this.contract.getUserId(address);
			return userId;
		} catch (error) {
			console.error("Error getting user ID:", error);
			return null;
		}
	}
}

export const authContract = new AuthContract();
