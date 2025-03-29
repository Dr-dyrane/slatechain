// app/settings/help-support/page.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HelpCircle, Search, MessageSquare, FileText, BookOpen, Mail, Phone, Video, X } from "lucide-react"
import Link from "next/link"

export default function HelpSupportPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const faqs = [
        {
            question: "How do I add a new supplier?",
            answer:
                "To add a new supplier, navigate to the Suppliers page and click the 'Add Supplier' button. Fill in the required information in the form and click 'Save'. You can either create a new user account for the supplier or convert an existing user to a supplier role.",
        },
        {
            question: "How can I track my shipments?",
            answer:
                "You can track shipments in the Logistics section. Each shipment has a unique tracking ID that updates in real-time. Click on any shipment to view detailed information including current location, estimated arrival time, and delivery status.",
        },
        {
            question: "How do I integrate with my existing ERP system?",
            answer:
                "Go to Settings > Integrations and select 'ERP & CRM' from the categories. Choose your ERP provider from the list and enter your API credentials. Once connected, SlateChain will automatically sync data with your ERP system.",
        },
        {
            question: "Can I manage user permissions?",
            answer:
                "Yes, administrators can manage user permissions by going to the Users section. From there, you can assign different roles (Admin, Manager, Supplier, Customer) to users, which determines their access level within the system.",
        },
        {
            question: "How do I connect my blockchain wallet?",
            answer:
                "To connect your blockchain wallet, go to your profile settings or use the 'Connect Wallet' button during login. You'll need to approve the connection request in your wallet (like MetaMask). Once connected, you can use your wallet for authentication and transactions.",
        },
        {
            question: "How can I generate reports?",
            answer:
                "Reports can be generated from the Dashboard or specific sections like Inventory or Orders. Look for the 'Export' or 'Generate Report' button. You can customize the report parameters and export in various formats including PDF, CSV, and Excel.",
        },
    ]

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between w-full mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold">Help & Support</h1>
                <Link href="/settings" className="border-4 rounded-full p-2 hover:bg-primary/10 hover:border-muted-foreground transition-colors">
                    <X className="h-6 w-6" />
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search for help topics..."
                    className="pl-10 py-6 text-sm rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Tabs defaultValue="faq" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 md:mb-8">
                    <TabsTrigger value="faq" className="flex flex-row items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        <span>FAQs</span>
                    </TabsTrigger>
                    <TabsTrigger value="guides" className="flex flex-row items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <span>Guides</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="hidden md:flex flex-row items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Contact Us</span>
                    </TabsTrigger>
                    <TabsTrigger value="documentation" className="hidden md:flex flex-row items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span >Document</span>
                    </TabsTrigger>
                </TabsList>
                <TabsList className="md:hidden grid grid-cols-2 mb-8">
                    <TabsTrigger value="contact" className="flex flex-row items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>Contact Us</span>
                    </TabsTrigger>
                    <TabsTrigger value="documentation" className="flex flex-row items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span>Document</span>
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="faq">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <HelpCircle className="h-6 w-6" />
                                <span>Frequently Asked Questions</span>
                            </CardTitle>
                            <CardDescription>Find answers to common questions about using SlateChain.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {searchQuery && filteredFaqs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                                        <Button variant="link" onClick={() => setSearchQuery("")}>
                                            Clear search
                                        </Button>
                                    </div>
                                ) : (
                                    filteredFaqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-muted-foreground">{faq.answer}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))
                                )}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="guides">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <BookOpen className="h-6 w-6" />
                                <span>User Guides</span>
                            </CardTitle>
                            <CardDescription>Step-by-step guides to help you get the most out of SlateChain.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <GuideCard
                                    title="Getting Started with SlateChain"
                                    description="Learn the basics of navigating and using SlateChain."
                                    icon={<BookOpen className="h-8 w-8" />}
                                    href="/settings/help-support/guides/getting-started"
                                />
                                <GuideCard
                                    title="Supplier Management"
                                    description="How to effectively manage your suppliers in the system."
                                    icon={<FileText className="h-8 w-8" />}
                                    href="/settings/help-support/guides/supplier-management"
                                />
                                <GuideCard
                                    title="Inventory Optimization"
                                    description="Tips and tricks for optimizing your inventory levels."
                                    icon={<FileText className="h-8 w-8" />}
                                    href="/settings/help-support/guides/inventory-optimization"
                                />
                                <GuideCard
                                    title="Blockchain Authentication"
                                    description="How to use blockchain wallet authentication securely."
                                    icon={<FileText className="h-8 w-8" />}
                                    href="/settings/help-support/guides/blockchain-auth"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <MessageSquare className="h-6 w-6" />
                                <span>Contact Support</span>
                            </CardTitle>
                            <CardDescription>Get in touch with our support team for personalized assistance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <ContactCard
                                    title="Email Support"
                                    description="Send us an email and we'll respond within 24 hours."
                                    icon={<Mail className="h-8 w-8" />}
                                    contactInfo="support@slatechain.com"
                                    actionLabel="Send Email"
                                    actionHref="mailto:support@slatechain.com"
                                />
                                <ContactCard
                                    title="Phone Support"
                                    description="Available Monday-Friday, 9am-5pm EST."
                                    icon={<Phone className="h-8 w-8" />}
                                    contactInfo="+1 (555) 123-4567"
                                    actionLabel="Call Now"
                                    actionHref="tel:+15551234567"
                                />
                                <ContactCard
                                    title="Video Support"
                                    description="Schedule a video call with our support team."
                                    icon={<Video className="h-8 w-8" />}
                                    contactInfo="Book a 30-minute session"
                                    actionLabel="Schedule Call"
                                    actionHref="/settings/help-support/schedule"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documentation">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center space-x-2">
                                <FileText className="h-6 w-6" />
                                <span>Documentation</span>
                            </CardTitle>
                            <CardDescription>Comprehensive documentation for all SlateChain features and APIs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DocSection
                                    title="User Documentation"
                                    items={[
                                        { title: "User Guide", href: "/settings/help-support/docs/user-guide" },
                                        { title: "Admin Guide", href: "/settings/help-support/docs/admin-guide" },
                                        { title: "Supplier Guide", href: "/settings/help-support/docs/supplier-guide" },
                                        { title: "Mobile App Guide", href: "/settings/help-support/docs/mobile-guide" },
                                    ]}
                                />
                                <DocSection
                                    title="Technical Documentation"
                                    items={[
                                        { title: "API Reference", href: "/settings/help-support/docs/api-reference" },
                                        { title: "Integration Guide", href: "/settings/help-support/docs/integration-guide" },
                                        { title: "Blockchain Integration", href: "/settings/help-support/docs/blockchain-integration" },
                                        { title: "Security Whitepaper", href: "/settings/help-support/docs/security-whitepaper" },
                                    ]}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

interface GuideCardProps {
    title: string
    description: string
    icon: React.ReactNode
    href: string
}

function GuideCard({ title, description, icon, href }: GuideCardProps) {
    return (
        <Link href={href} className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">{title}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

interface ContactCardProps {
    title: string
    description: string
    icon: React.ReactNode
    contactInfo: string
    actionLabel: string
    actionHref: string
}

function ContactCard({ title, description, icon, contactInfo, actionLabel, actionHref }: ContactCardProps) {
    return (
        <Card className="h-full">
            <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <div className="text-center my-4 font-medium">{contactInfo}</div>
                <div className="mt-auto">
                    <Button asChild className="w-full">
                        <Link href={actionHref}>{actionLabel}</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

interface DocSectionProps {
    title: string
    items: { title: string; href: string }[]
}

function DocSection({ title, items }: DocSectionProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li key={index}>
                        <Link
                            href={item.href}
                            className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors"
                        >
                            <FileText className="h-4 w-4 text-primary" />
                            <span>{item.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

