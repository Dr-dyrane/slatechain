import Navbar from "@/components/marketing/Navbar"
import Footer from "@/components/marketing/Footer"
import { Card, CardContent } from "@/components/ui/card"
import {
    Shield,
    Server,
    Users,
    Scale,
    Clock,
    Globe,
    Building2,
    Warehouse,
    Truck,
    BadgeAlert,
    FileWarning,
    ScrollText,
} from "lucide-react"

const sections = [
    {
        icon: Shield,
        title: "1. Platform Terms",
        content:
            "By accessing SupplyCycles's supply chain management platform, you agree to these terms. Our platform provides inventory management, order tracking, and logistics optimization services.",
        highlights: [
            "Access to supply chain management tools",
            "Real-time inventory tracking system",
            "Order management capabilities",
            "Logistics optimization features",
        ],
    },
    {
        icon: Server,
        title: "2. Data Processing",
        content:
            "We process supply chain data including inventory levels, order details, shipping information, and warehouse management data to provide our services.",
        highlights: [
            "Secure data storage and processing",
            "Regular data backups",
            "Data retention policies",
            "Access control mechanisms",
        ],
    },
    {
        icon: Users,
        title: "3. User Roles & Access",
        content:
            "SupplyCycles supports multiple user roles including administrators, warehouse managers, suppliers, and customers. Each role has specific access permissions and responsibilities.",
        highlights: [
            "Role-based access control",
            "User permission management",
            "Account security requirements",
            "Multi-factor authentication options",
        ],
    },
    {
        icon: Scale,
        title: "4. Service Level Agreement",
        content:
            "We commit to 99.9% platform uptime and provide support during business hours. Emergency support is available 24/7 for critical issues.",
        highlights: ["99.9% uptime guarantee", "Response time commitments", "Support availability", "Maintenance windows"],
    },
    {
        icon: Clock,
        title: "5. Platform Usage",
        content:
            "Users must comply with usage limits and fair use policies. API rate limits and data storage quotas apply based on your subscription plan.",
        highlights: ["API rate limits", "Storage quotas", "Usage monitoring", "Fair use guidelines"],
    },
    {
        icon: Globe,
        title: "6. International Operations",
        content:
            "SupplyCycles operates globally and complies with international trade and data protection regulations. Users must ensure compliance with local laws.",
        highlights: [
            "International data transfers",
            "Regulatory compliance",
            "Cross-border transactions",
            "Local law adherence",
        ],
    },
    {
        icon: Building2,
        title: "7. Third-Party Integrations",
        content:
            "Integration with third-party services (ERP, CRM, etc.) is subject to additional terms. Users are responsible for maintaining their integration credentials.",
        highlights: [
            "Integration requirements",
            "API credentials security",
            "Third-party compliance",
            "Integration limitations",
        ],
    },
    {
        icon: Warehouse,
        title: "8. Warehouse Management",
        content:
            "Users must maintain accurate warehouse data and follow inventory management best practices. Regular audits may be required.",
        highlights: [
            "Inventory accuracy requirements",
            "Warehouse safety standards",
            "Audit compliance",
            "Storage guidelines",
        ],
    },
    {
        icon: Truck,
        title: "9. Shipping & Logistics",
        content:
            "Users must provide accurate shipping information and comply with carrier requirements. SupplyCycles is not liable for carrier delays or errors.",
        highlights: ["Shipping requirements", "Carrier compliance", "Delivery timeframes", "Insurance requirements"],
    },
    {
        icon: BadgeAlert,
        title: "10. Compliance Requirements",
        content:
            "Users must comply with industry regulations, including but not limited to FDA, FSMA, and other relevant standards for their industry.",
        highlights: ["Regulatory compliance", "Industry standards", "Documentation requirements", "Audit trails"],
    },
    {
        icon: FileWarning,
        title: "11. Liability & Indemnification",
        content:
            "SupplyCycles's liability is limited to the terms specified in your subscription agreement. Users indemnify SupplyCycles against third-party claims.",
        highlights: ["Liability limitations", "Indemnification terms", "Dispute resolution", "Insurance requirements"],
    },
    {
        icon: ScrollText,
        title: "12. Terms Updates",
        content:
            "SupplyCycles may update these terms with 30 days notice. Continued use of the platform constitutes acceptance of updated terms.",
        highlights: ["Update notification process", "Change acceptance", "Prior version access", "Opt-out rights"],
    },
]

export default function TermsPage() {
    return (
        <div className="relative min-h-screen flex flex-col p-4">
            <div className="absolute mt-20 rounded-3xl inset-0 flex items-start min-h-screen justify-center text-wrap text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[20vw] opacity-10">
                TERMS
            </div>
            <Navbar />

            <main className="flex-grow p-4 min-h-[80vh] mt-4 mb-8 rounded-3xl mx-auto flex flex-col 
            justify-center items-center text-center py-8 relative z-10">
                <h1 className="text-4xl font-bold tracking-tight text-left w-full mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
                    Terms of Service
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
                                <p className="text-muted-foreground text-justify mb-4">{section.content}</p>
                                {section.highlights && (
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {section.highlights.map((item) => (
                                            <li key={item} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-primary" />
                                                <span className="text-sm">{item}</span>
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

