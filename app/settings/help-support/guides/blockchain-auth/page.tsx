// app/settings/help-support/guides/blockchain-auth/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Shield, Wallet, AlertTriangle, CheckCircle, Key } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BlockchainAuthGuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Blockchain Authentication Guide</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Using Blockchain Authentication in SlateChain</span>
          </CardTitle>
          <CardDescription>Learn how to securely authenticate using your blockchain wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="login">Login Process</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Blockchain Authentication Overview"
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="text-2xl font-semibold mt-6">Blockchain Authentication Overview</h2>
              <p className="text-muted-foreground">
                SlateChain offers blockchain-based authentication as a secure alternative to traditional username and
                password login. This method uses cryptographic signatures from your blockchain wallet to verify your
                identity, providing enhanced security and convenience.
              </p>

              <h3 className="text-xl font-medium mt-6">Key Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <BenefitCard
                  icon={<Shield className="h-8 w-8" />}
                  title="Enhanced Security"
                  description="Cryptographic signatures provide stronger security than passwords, which can be forgotten, stolen, or guessed."
                />
                <BenefitCard
                  icon={<Wallet className="h-8 w-8" />}
                  title="Simplified Access"
                  description="No need to remember complex passwords or go through password reset processes."
                />
                <BenefitCard
                  icon={<Key className="h-8 w-8" />}
                  title="Self-Sovereign Identity"
                  description="You maintain control of your identity without relying on centralized identity providers."
                />
              </div>

              <h3 className="text-xl font-medium mt-8">How It Works</h3>
              <div className="space-y-4 mt-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Connect Your Wallet</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the "Connect Wallet" button and approve the connection request in your wallet (like
                      MetaMask).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Sign a Message</h4>
                    <p className="text-sm text-muted-foreground">
                      SlateChain generates a unique message that you sign with your wallet to prove ownership.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      SlateChain verifies the signature against your wallet address to authenticate you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Access Granted</h4>
                    <p className="text-sm text-muted-foreground">
                      Upon successful verification, you're logged in and can access your SlateChain account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-lg mt-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Important Note
                </h3>
                <p className="text-sm text-muted-foreground">
                  Blockchain authentication requires a compatible wallet like MetaMask, Coinbase Wallet, or
                  WalletConnect. Make sure you have one of these wallets installed and set up before proceeding.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="setup" className="space-y-6">
              <h2 className="text-2xl font-semibold">Setting Up Blockchain Authentication</h2>
              <p className="text-muted-foreground mb-6">
                Follow these steps to set up blockchain authentication for your SlateChain account.
              </p>

              <div className="space-y-8">
                <SetupStepCard
                  number={1}
                  title="Install a Compatible Wallet"
                  description="If you don't already have one, install a compatible blockchain wallet like MetaMask, Coinbase Wallet, or another Ethereum-compatible wallet."
                  image="/placeholder.svg?height=300&width=600"
                  tips={[
                    "MetaMask is available as a browser extension for Chrome, Firefox, and Edge",
                    "Mobile wallets can also be used via WalletConnect",
                    "Make sure to securely back up your wallet's recovery phrase",
                  ]}
                />

                <SetupStepCard
                  number={2}
                  title="Register or Login to SlateChain"
                  description="Navigate to the SlateChain login page and click on 'Sign in with Blockchain' or 'Register with Blockchain'."
                  image="/placeholder.svg?height=300&width=600"
                  tips={[
                    "You can find this option on both the login and registration pages",
                    "If you already have an account, you can add blockchain authentication in your profile settings",
                  ]}
                />

                <SetupStepCard
                  number={3}
                  title="Connect Your Wallet"
                  description="Click the 'Connect Wallet' button and select your wallet provider from the options presented."
                  image="/placeholder.svg?height=300&width=600"
                  tips={[
                    "Ensure your wallet is unlocked before attempting to connect",
                    "You may need to approve the connection request in your wallet",
                    "Only connect your wallet on the official SlateChain website",
                  ]}
                />

                <SetupStepCard
                  number={4}
                  title="Complete Registration or Login"
                  description="For registration, provide additional required information. For login, sign the authentication message with your wallet."
                  image="/placeholder.svg?height=300&width=600"
                  tips={[
                    "The signature request is only for authentication and cannot transfer funds",
                    "Verify the message content before signing",
                    "Each login session requires a new signature",
                  ]}
                />
              </div>

              <div className="bg-muted p-6 rounded-lg mt-6">
                <h3 className="font-semibold mb-2">Troubleshooting</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium">Wallet not connecting?</p>
                    <p>
                      Make sure your wallet is unlocked and the browser extension is up to date. Try refreshing the page
                      or restarting your browser.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Signature request not appearing?</p>
                    <p>
                      Check if your wallet is properly connected and that you have the necessary permissions enabled.
                      Some wallets minimize signature requests to the extension icon.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Wrong network?</p>
                    <p>
                      Ensure your wallet is connected to the Ethereum mainnet or the network specified by SlateChain.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="login" className="space-y-6">
              <h2 className="text-2xl font-semibold">Blockchain Login Process</h2>
              <p className="text-muted-foreground mb-6">
                Once you've set up blockchain authentication, follow these steps to log in to your SlateChain account.
              </p>

              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Blockchain Login Process"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-6">
                <LoginStepCard
                  number={1}
                  title="Navigate to Login Page"
                  description="Go to the SlateChain login page and click on 'Sign in with Blockchain'."
                />

                <LoginStepCard
                  number={2}
                  title="Connect Your Wallet"
                  description="Click the 'Connect Wallet' button and select your wallet provider from the options."
                />

                <LoginStepCard
                  number={3}
                  title="Sign the Authentication Message"
                  description="A signature request will appear in your wallet. Review the message and sign it to prove your identity."
                />

                <LoginStepCard
                  number={4}
                  title="Access Your Account"
                  description="Once the signature is verified, you'll be automatically logged in to your SlateChain account."
                />
              </div>

              <h3 className="text-xl font-medium mt-8">Understanding the Signature Request</h3>
              <div className="bg-muted p-6 rounded-lg mt-4">
                <p className="text-muted-foreground mb-4">
                  When logging in, you'll be asked to sign a message that looks something like this:
                </p>
                <div className="bg-background p-4 rounded border text-sm font-mono mb-4">
                  Sign this message to authenticate with SlateChain: 123456
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">The message should always mention SlateChain</p>
                      <p>Never sign messages claiming to be from SlateChain on other websites</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">The message includes a unique number (nonce)</p>
                      <p>This prevents replay attacks and ensures the signature can only be used once</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Never sign transactions during login</p>
                      <p>Authentication only requires message signing, not transaction signing</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <h2 className="text-2xl font-semibold">Security Best Practices</h2>
              <p className="text-muted-foreground mb-6">
                Follow these security best practices to keep your blockchain authentication secure.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SecurityCard
                  icon={<Key className="h-8 w-8" />}
                  title="Protect Your Private Keys"
                  description="Never share your wallet's private keys or recovery phrase with anyone. Store them securely offline."
                />

                <SecurityCard
                  icon={<Shield className="h-8 w-8" />}
                  title="Verify Signature Requests"
                  description="Always carefully read signature requests before approving them. Only sign messages from trusted sources."
                />

                <SecurityCard
                  icon={<AlertTriangle className="h-8 w-8" />}
                  title="Beware of Phishing"
                  description="Always check the URL before connecting your wallet. Use bookmarks for SlateChain to avoid phishing sites."
                />

                <SecurityCard
                  icon={<Wallet className="h-8 w-8" />}
                  title="Use Hardware Wallets"
                  description="For enhanced security, consider using a hardware wallet like Ledger or Trezor for blockchain authentication."
                />
              </div>

              <h3 className="text-xl font-medium mt-8">Frequently Asked Security Questions</h3>
              <div className="space-y-4 mt-4">
                <SecurityQuestion
                  question="Can SlateChain access my funds?"
                  answer="No. SlateChain only verifies signatures to authenticate you. The application never has access to your private keys or funds. Authentication uses message signing, not transaction signing."
                />

                <SecurityQuestion
                  question="What happens if I lose access to my wallet?"
                  answer="If you lose access to your wallet, you can still log in using your email and password if you've set them up. You can then connect a new wallet in your account settings. It's recommended to have multiple authentication methods enabled."
                />

                <SecurityQuestion
                  question="Is my wallet address visible to other users?"
                  answer="Your wallet address is not publicly displayed to other users by default. You can control your privacy settings in your account preferences."
                />

                <SecurityQuestion
                  question="Can I use multiple wallets with my account?"
                  answer="Yes, you can connect multiple wallets to your SlateChain account for added convenience and security. This can be managed in your account settings."
                />
              </div>

              <div className="bg-muted p-6 rounded-lg mt-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Security Commitment
                </h3>
                <p className="text-sm text-muted-foreground">
                  SlateChain is committed to maintaining the highest security standards for blockchain authentication.
                  We regularly audit our authentication systems, use industry best practices for cryptographic
                  verification, and never store private keys or sensitive wallet information.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/settings/help-support">Back to Help Center</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Try Blockchain Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface SetupStepCardProps {
  number: number
  title: string
  description: string
  image: string
  tips: string[]
}

function SetupStepCard({ number, title, description, image, tips }: SetupStepCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
            {number}
          </div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <p className="text-muted-foreground pl-11">{description}</p>

        {tips.length > 0 && (
          <div className="pl-11 mt-4">
            <h4 className="text-sm font-medium mb-2">Tips:</h4>
            <ul className="space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="relative h-48 rounded-lg overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={`Step ${number}: ${title}`} fill className="object-cover" />
      </div>
    </div>
  )
}

interface LoginStepCardProps {
  number: number
  title: string
  description: string
}

function LoginStepCard({ number, title, description }: LoginStepCardProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
        {number}
      </div>
      <div className="space-y-1 border-l pl-6 pb-6 border-dashed">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

interface SecurityCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function SecurityCard({ icon, title, description }: SecurityCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SecurityQuestionProps {
  question: string
  answer: string
}

function SecurityQuestion({ question, answer }: SecurityQuestionProps) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-2">{question}</h4>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  )
}

