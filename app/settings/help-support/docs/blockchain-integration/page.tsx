// app/settings/help-support/docs/blockchain-integration/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search, ChevronRight, Wallet } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"

export default function BlockchainIntegrationPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Blockchain Integration</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search in blockchain integration..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Contents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                <TableOfContentsItem href="#introduction" label="Introduction" />
                <TableOfContentsItem href="#getting-started" label="Getting Started" />
                <TableOfContentsItem href="#authentication" label="Blockchain Authentication" isExpanded>
                  <TableOfContentsItem href="#wallet-connect" label="Wallet Connect" level={2} />
                  <TableOfContentsItem href="#metamask" label="MetaMask Integration" level={2} />
                  <TableOfContentsItem href="#signature-verification" label="Signature Verification" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#smart-contracts" label="Smart Contracts" isExpanded>
                  <TableOfContentsItem href="#contract-deployment" label="Contract Deployment" level={2} />
                  <TableOfContentsItem href="#contract-interaction" label="Contract Interaction" level={2} />
                  <TableOfContentsItem href="#event-listening" label="Event Listening" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#supply-chain-tracking" label="Supply Chain Tracking" />
                <TableOfContentsItem href="#document-verification" label="Document Verification" />
                <TableOfContentsItem href="#security" label="Security Considerations" />
                <TableOfContentsItem href="#troubleshooting" label="Troubleshooting" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="code">Code Examples</TabsTrigger>
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-8">
                <section id="introduction" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Introduction to Blockchain Integration</h2>
                  <p className="text-muted-foreground mb-4">
                    SupplyCycles leverages blockchain technology to enhance security, transparency, and traceability in
                    supply chain operations. This guide provides comprehensive information on integrating blockchain
                    capabilities into your SupplyCycles implementation.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Blockchain integration in SupplyCycles enables secure authentication, immutable record-keeping, smart
                    contract automation, and verifiable tracking of goods throughout the supply chain.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Key Benefits</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Enhanced security through cryptographic authentication</li>
                      <li>Immutable audit trail for all supply chain transactions</li>
                      <li>Smart contract automation for business rules and agreements</li>
                      <li>Transparent and verifiable product provenance</li>
                      <li>Reduced fraud and counterfeiting risks</li>
                      <li>Streamlined compliance and certification processes</li>
                    </ul>
                  </div>
                </section>

                <section id="getting-started" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Getting Started with Blockchain Integration</h2>
                  <p className="text-muted-foreground mb-4">
                    Before implementing blockchain features in SupplyCycles, it's important to understand the
                    prerequisites and setup requirements.
                  </p>

                  <h3 className="text-xl font-medium mt-6 mb-3">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                    <li>Basic understanding of blockchain technology and concepts</li>
                    <li>Ethereum-compatible wallet (MetaMask, WalletConnect, etc.)</li>
                    <li>Access to blockchain networks (Ethereum, Polygon, etc.)</li>
                    <li>SupplyCycles Enterprise plan or higher</li>
                    <li>API access with blockchain permissions enabled</li>
                  </ul>

                  <h3 className="text-xl font-medium mt-6 mb-3">Configuration Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                    <li>Enable blockchain features in your SupplyCycles account settings</li>
                    <li>Configure the blockchain network settings (Mainnet, Testnet, etc.)</li>
                    <li>Set up wallet integration for authentication</li>
                    <li>Configure smart contract settings if using custom contracts</li>
                    <li>Set up event listeners for blockchain events</li>
                  </ol>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Supported Blockchain Networks</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium">Ethereum Networks:</p>
                        <ul className="list-disc list-inside">
                          <li>Ethereum Mainnet</li>
                          <li>Goerli Testnet</li>
                          <li>Sepolia Testnet</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Layer 2 & Sidechains:</p>
                        <ul className="list-disc list-inside">
                          <li>Polygon</li>
                          <li>Arbitrum</li>
                          <li>Optimism</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="authentication" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Blockchain Authentication</h2>
                  <p className="text-muted-foreground mb-4">
                    SupplyCycles supports blockchain-based authentication, allowing users to sign in using their
                    blockchain wallets instead of traditional username and password.
                  </p>

                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="Blockchain Authentication Flow"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h3 id="wallet-connect" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Wallet Connect Integration
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    WalletConnect provides a secure connection between your SupplyCycles application and blockchain
                    wallets. It supports a wide range of wallets and is ideal for mobile users.
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Enable WalletConnect in your SupplyCycles settings</li>
                    <li>Configure the WalletConnect bridge URL</li>
                    <li>Customize the connection modal (optional)</li>
                    <li>Implement the connection flow in your application</li>
                  </ol>

                  <h3 id="metamask" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    MetaMask Integration
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    MetaMask is one of the most popular Ethereum wallets and provides a seamless integration experience
                    for web applications.
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Enable MetaMask integration in your SupplyCycles settings</li>
                    <li>Configure the network settings (chain ID, RPC URL)</li>
                    <li>Implement the connection button in your application</li>
                    <li>Handle connection events and state management</li>
                  </ol>

                  <h3 id="signature-verification" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Signature Verification
                  </h3>
                  <p className="text-muted-foreground">
                    Signature verification is the core of blockchain authentication. It ensures that users have control
                    over the wallet address they claim to own.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Generate a unique message for the user to sign</li>
                    <li>Request a signature from the user's wallet</li>
                    <li>Verify the signature on the server side</li>
                    <li>Associate the verified wallet address with the user account</li>
                    <li>Issue authentication tokens for subsequent requests</li>
                  </ul>
                </section>

                <section id="smart-contracts" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Smart Contracts</h2>
                  <p className="text-muted-foreground mb-4">
                    Smart contracts enable automated, trustless execution of business logic on the blockchain.
                    SupplyCycles provides tools for deploying and interacting with smart contracts for supply chain
                    operations.
                  </p>

                  <h3 id="contract-deployment" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Contract Deployment
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    SupplyCycles offers several options for deploying smart contracts:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">Pre-built Contracts:</span> Use SupplyCycles's library of supply chain
                      smart contracts
                    </li>
                    <li>
                      <span className="font-medium">Custom Deployment:</span> Deploy your own custom smart contracts
                    </li>
                    <li>
                      <span className="font-medium">Proxy Contracts:</span> Use upgradeable contracts for flexibility
                    </li>
                  </ul>

                  <h3 id="contract-interaction" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Contract Interaction
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Once deployed, you can interact with smart contracts through:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">SupplyCycles UI:</span> Built-in interface for common contract
                      interactions
                    </li>
                    <li>
                      <span className="font-medium">API:</span> Programmatic interaction via the SupplyCycles API
                    </li>
                    <li>
                      <span className="font-medium">Direct Web3:</span> Use Web3.js or ethers.js for custom interactions
                    </li>
                  </ul>

                  <h3 id="event-listening" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Event Listening
                  </h3>
                  <p className="text-muted-foreground">
                    Smart contracts emit events that can be monitored to trigger actions in your application:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Configure event listeners in SupplyCycles settings</li>
                    <li>Set up webhooks to be triggered by contract events</li>
                    <li>Implement real-time updates based on blockchain events</li>
                    <li>Create automated workflows triggered by contract events</li>
                  </ul>
                </section>

                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button asChild>
                    <Link href="#supply-chain-tracking">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
                <p className="text-muted-foreground mb-6">
                  These examples demonstrate how to implement blockchain features in your SupplyCycles integration.
                </p>

                <Tabs defaultValue="authentication">
                  <TabsList className="mb-4">
                    <TabsTrigger value="authentication">Authentication</TabsTrigger>
                    <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
                    <TabsTrigger value="tracking">Supply Chain Tracking</TabsTrigger>
                  </TabsList>

                  <TabsContent value="authentication">
                    <Card>
                      <CardHeader>
                        <CardTitle>Wallet Authentication Example</CardTitle>
                        <CardDescription>Implementing blockchain wallet authentication</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="block bg-background p-4 rounded border text-sm font-mono whitespace-pre overflow-x-auto">
                          {`// React component for wallet authentication
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function WalletAuth() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect to wallet
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Generate a nonce for the user to sign
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = \`Sign this message to authenticate with SupplyCycles: \${nonce}\`;
      
      // Request signature from the user
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      
      // Send the signature to the server for verification
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signature,
          nonce
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const data = await response.json();
      
      // Store the authentication token
      localStorage.setItem('authToken', data.token);
      
      // Update state
      setAccount(address);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    localStorage.removeItem('authToken');
    setAccount(null);
  };

  return (
    <div>
      {account ? (
        <div>
          <p>Connected: {account}</p>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </div>
      ) : (
        <button 
          onClick={connectWallet} 
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default WalletAuth;`}
                        </code>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contracts">
                    <Card>
                      <CardHeader>
                        <CardTitle>Smart Contract Interaction</CardTitle>
                        <CardDescription>Interacting with a supply chain tracking contract</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="block bg-background p-4 rounded border text-sm font-mono whitespace-pre overflow-x-auto">
                          {`// Smart contract interaction example
import { ethers } from 'ethers';

// Contract ABI (Application Binary Interface)
const contractABI = [
  "function registerProduct(string memory productId, string memory metadata) public",
  "function updateProductStatus(string memory productId, string memory status, string memory location) public",
  "function getProductHistory(string memory productId) public view returns (string[] memory)",
  "event ProductRegistered(string productId, address registeredBy, uint256 timestamp)",
  "event ProductUpdated(string productId, string status, string location, address updatedBy, uint256 timestamp)"
];

// Contract address - replace with your deployed contract address
const contractAddress = "0x123..."; // Your contract address

// Function to register a new product on the blockchain
async function registerProduct(productId, metadata) {
  try {
    // Connect to provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Call the contract function
    const tx = await contract.registerProduct(productId, JSON.stringify(metadata));
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Look for the event in the receipt
    const event = receipt.events.find(event => event.event === 'ProductRegistered');
    
    if (event) {
      console.log("Product registered successfully:", event.args);
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    }
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error registering product:", error);
    throw error;
  }
}

// Function to update product status
async function updateProductStatus(productId, status, location) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    const tx = await contract.updateProductStatus(productId, status, location);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error("Error updating product status:", error);
    throw error;
  }
}

// Function to get product history
async function getProductHistory(productId) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    const history = await contract.getProductHistory(productId);
    return history.map(item => JSON.parse(item));
  } catch (error) {
    console.error("Error getting product history:", error);
    throw error;
  }
}

export { registerProduct, updateProductStatus, getProductHistory };`}
                        </code>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tracking">
                    <Card>
                      <CardHeader>
                        <CardTitle>Supply Chain Tracking</CardTitle>
                        <CardDescription>Implementing blockchain-based supply chain tracking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="block bg-background p-4 rounded border text-sm font-mono whitespace-pre overflow-x-auto">
                          {`// Server-side implementation of blockchain tracking
import { ethers } from 'ethers';
import { SupplyCyclesAPI } from '@/lib/api';

// Contract configuration
const contractABI = [...]; // Your contract ABI
const contractAddress = process.env.TRACKING_CONTRACT_ADDRESS;

// Provider configuration
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Listen for blockchain events
async function setupEventListeners() {
  // Listen for product registration events
  contract.on("ProductRegistered", async (productId, registeredBy, timestamp) => {
    console.log(\`Product \${productId} registered on blockchain by \${registeredBy}\`);
    
    // Update SupplyCycles with blockchain verification
    try {
      await SupplyCyclesAPI.updateProduct(productId, {
        blockchainVerified: true,
        blockchainTimestamp: new Date(timestamp.toNumber() * 1000).toISOString(),
        blockchainTxHash: event.transactionHash
      });
    } catch (error) {
      console.error("Error updating SupplyCycles:", error);
    }
  });
  
  // Listen for product status updates
  contract.on("ProductUpdated", async (productId, status, location, updatedBy, timestamp) => {
    console.log(\`Product \${productId} updated to status: \${status} at \${location}\`);
    
    // Update SupplyCycles with the new status
    try {
      await SupplyCyclesAPI.updateProductStatus(productId, {
        status,
        location,
        blockchainVerified: true,
        blockchainTimestamp: new Date(timestamp.toNumber() * 1000).toISOString(),
        blockchainTxHash: event.transactionHash
      });
    } catch (error) {
      console.error("Error updating SupplyCycles status:", error);
    }
  });
}

// Initialize event listeners
setupEventListeners().catch(console.error);

// API endpoint to register a product on the blockchain
export async function registerProductOnBlockchain(req, res) {
  try {
    const { productId, metadata } = req.body;
    
    // Validate input
    if (!productId || !metadata) {
      return res.status(400).json({ error: "Product ID and metadata are required" });
    }
    
    // Register on blockchain
    const tx = await contract.registerProduct(productId, JSON.stringify(metadata));
    const receipt = await tx.wait();
    
    return res.status(200).json({
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    });
  } catch (error) {
    console.error("Error registering product on blockchain:", error);
    return res.status(500).json({ error: "Failed to register product on blockchain" });
  }
}`}
                        </code>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="architecture" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Blockchain Architecture</h2>
                <p className="text-muted-foreground mb-6">
                  These diagrams illustrate the architecture of SupplyCycles's blockchain integration.
                </p>

                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Authentication Architecture</CardTitle>
                      <CardDescription>Blockchain wallet authentication flow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Authentication Architecture"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Smart Contract Architecture</CardTitle>
                      <CardDescription>Smart contract interaction and event flow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Smart Contract Architecture"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Supply Chain Tracking Architecture</CardTitle>
                      <CardDescription>Blockchain-based supply chain tracking system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Supply Chain Tracking Architecture"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface TableOfContentsItemProps {
  href: string
  label: string
  level?: number
  isExpanded?: boolean
  children?: React.ReactNode
}

function TableOfContentsItem({ href, label, level = 1, isExpanded = false, children }: TableOfContentsItemProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  const hasChildren = Boolean(children)

  return (
    <div className="space-y-1">
      <div className={`flex items-center ${level > 1 ? "pl-4" : ""}`}>
        {hasChildren && (
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 mr-1" onClick={() => setExpanded(!expanded)}>
            <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </Button>
        )}
        <Link href={href} className={`text-sm hover:underline ${level > 1 ? "text-muted-foreground" : "font-medium"}`}>
          {label}
        </Link>
      </div>
      {expanded && children && <div className="ml-2">{children}</div>}
    </div>
  )
}

