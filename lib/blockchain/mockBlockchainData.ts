// Mock blockchain data for demo mode
import type { MockBlockchainData } from "./web3Provider"

// Demo wallet data
export const mockWalletData: MockBlockchainData = {
  wallet: {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    chainId: 1,
    isConnected: true,
    type: "MetaMask",
  },
  balance: "0.1425 ETH",
  transactions: [
    {
      id: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      type: "Transfer",
      amount: "0.05 ETH",
      date: "2023-03-15",
      status: "Confirmed",
      to: "0x8901234567890123456789012345678901234567",
      from: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      gasUsed: "0.002 ETH",
    },
    {
      id: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
      type: "Contract Interaction",
      amount: "0.01 ETH",
      date: "2023-03-10",
      status: "Confirmed",
      to: "0x1234567890123456789012345678901234567890",
      from: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      gasUsed: "0.003 ETH",
    },
    {
      id: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
      type: "Receive",
      amount: "0.2 ETH",
      date: "2023-02-28",
      status: "Confirmed",
      to: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      from: "0x2345678901234567890123456789012345678901",
      gasUsed: "0",
    },
    {
      id: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
      type: "NFT Purchase",
      amount: "0.08 ETH",
      date: "2023-02-15",
      status: "Confirmed",
      to: "0x3456789012345678901234567890123456789012",
      from: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      gasUsed: "0.004 ETH",
    },
    {
      id: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      type: "Swap",
      amount: "0.1 ETH → 300 USDC",
      date: "2023-02-01",
      status: "Confirmed",
      to: "0x4567890123456789012345678901234567890123",
      from: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      gasUsed: "0.005 ETH",
    },
  ],
  tokens: [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: "0.1425",
      usdValue: "$285.00",
      icon: "/icons/ethereum.svg",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: "300.00",
      usdValue: "$300.00",
      icon: "/icons/usdc.svg",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      balance: "10.5",
      usdValue: "$105.00",
      icon: "/icons/chainlink.svg",
    },
    {
      symbol: "UNI",
      name: "Uniswap",
      balance: "5.25",
      usdValue: "$26.25",
      icon: "/icons/uniswap.svg",
    },
  ],
  nfts: [
    {
      id: "1",
      name: "CryptoPunk #1234",
      image: "/nfts/cryptopunk.jpg",
      collection: "CryptoPunks",
      floorPrice: "10 ETH",
    },
    {
      id: "2",
      name: "Bored Ape #5678",
      image: "/nfts/boredape.jpg",
      collection: "Bored Ape Yacht Club",
      floorPrice: "80 ETH",
    },
  ],
}

