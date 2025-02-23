import Navbar from "@/components/marketing/Navbar"
import Footer from "@/components/marketing/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Lock, Bell, Database, Globe, Server, Eye, Key, FileStack, RefreshCw, Scale } from "lucide-react"

const sections = [
    {
        icon: Users,
        title: "1. Information We Collect",
        content: "We collect and process supply chain data necessary for platform operations.",
        items: [
            "User account and profile information",
            "Inventory and warehouse data",
            "Order and shipping details",
            "Supplier and customer information",
            "Integration credentials and settings",
            "Usage analytics and logs",
        ],
    },
    {
        icon: Database,
        title: "2. Supply Chain Data",
        content: "We process specific supply chain related information to provide our services.",
        items: [
            "Inventory levels and locations",
            "Warehouse management data",
            "Shipping and logistics information",
            "Supplier performance metrics",
            "Order tracking details",
            "Production schedules",
        ],
    },
    {
        icon: Lock,
        title: "3. Data Security",
        content: "We implement comprehensive security measures to protect your supply chain data.",
        items: [
            "End-to-end encryption",
            "Regular security audits",
            "Access control systems",
            "Data backup protocols",
            "Incident response plans",
            "Security compliance monitoring",
        ],
    },
    {
        icon: Globe,
        title: "4. International Data Transfers",
        content: "We transfer data globally to provide our services while maintaining security.",
        items: [
            "Cross-border data protection",
            "Regional data centers",
            "Compliance with local regulations",
            "International privacy standards",
            "Data residency options",
            "Transfer impact assessments",
        ],
    },
    {
        icon: Server,
        title: "5. Third-Party Integrations",
        content: "We share data with authorized third-party services based on your integrations.",
        items: [
            "ERP system connections",
            "CRM integrations",
            "Payment processor sharing",
            "Shipping carrier APIs",
            "Analytics services",
            "Cloud storage providers",
        ],
    },
    {
        icon: Eye,
        title: "6. Data Access & Control",
        content: "We provide tools to manage your data and control access permissions.",
        items: [
            "Role-based access control",
            "User permission management",
            "Data export capabilities",
            "Access logs and monitoring",
            "Data deletion options",
            "Privacy preference settings",
        ],
    },
    {
        icon: Key,
        title: "7. Data Protection",
        content: "We implement industry-standard protections for your supply chain data.",
        items: [
            "Encryption at rest and in transit",
            "Regular penetration testing",
            "Vulnerability assessments",
            "Security certifications",
            "Compliance monitoring",
            "Incident response procedures",
        ],
    },
    {
        icon: FileStack,
        title: "8. Data Retention",
        content: "We maintain data according to retention policies and compliance requirements.",
        items: [
            "Retention period definitions",
            "Archival procedures",
            "Data deletion protocols",
            "Compliance requirements",
            "Backup retention",
            "Historical data management",
        ],
    },
    {
        icon: Bell,
        title: "9. Communications",
        content: "We communicate important updates and information about our services.",
        items: [
            "Service notifications",
            "Security alerts",
            "Platform updates",
            "Marketing communications",
            "Support messages",
            "Privacy policy updates",
        ],
    },
    {
        icon: Scale,
        title: "10. Legal Compliance",
        content: "We comply with global privacy laws and industry regulations.",
        items: [
            "GDPR compliance",
            "CCPA compliance",
            "Industry standards",
            "Regulatory requirements",
            "Privacy impact assessments",
            "Regular compliance audits",
        ],
    },
    {
        icon: Shield,
        title: "11. Data Protection Rights",
        content: "We respect and uphold your data protection and privacy rights.",
        items: [
            "Right to access",
            "Right to rectification",
            "Right to erasure",
            "Right to portability",
            "Right to object",
            "Consent management",
        ],
    },
    {
        icon: RefreshCw,
        title: "12. Policy Updates",
        content: "We regularly update our privacy practices to maintain protection standards.",
        items: [
            "Update notifications",
            "Version tracking",
            "Change documentation",
            "User acknowledgment",
            "Previous version access",
            "Feedback process",
        ],
    },
]

export default function PolicyPage() {
    return (
        <div className="relative min-h-screen flex flex-col p-4">
            <div className="absolute mt-20 rounded-3xl inset-0 flex items-start min-h-screen justify-center text-wrap text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[20vw] opacity-10">
                PRIVACY
            </div>
            <Navbar />

            <main className="flex-grow p-4 min-h-[80vh] my-8 rounded-3xl mx-auto flex flex-col justify-center items-center text-center py-8 relative z-10">
                <h1 className="text-4xl font-bold tracking-tight text-left w-full mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
                    Privacy Policy
                </h1>

                <div className="grid gap-8 w-full">
                    {sections.map((section) => (
                        <Card key={section.title} className="group hover:scale-[1.02] transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 w-fit">
                                        <section.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-right">{section.title}</h2>
                                </div>
                                <p className="text-muted-foreground w-full text-justify mb-4">{section.content}</p>
                                {section.items && (
                                    <ul className="grid sm:grid-cols-2 gap-2 scrollbar-hide">
                                        {section.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-sm text-nowrap text-ellipsis">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    )
}

