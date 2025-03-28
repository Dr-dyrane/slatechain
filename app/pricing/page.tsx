import Link from "next/link"
import { Check, CircleArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/marketing/Navbar"
import Footer from "@/components/marketing/Footer"

const tiers = [
    {
        name: "Starter",
        description: "Perfect for small businesses getting started with supply chain management.",
        price: "$199",
        duration: "per month",
        features: [
            "Up to 100 inventory items",
            "Basic order tracking",
            "Email support",
            "1 warehouse location",
            "Standard analytics",
        ],
    },
    {
        name: "Professional",
        description: "Ideal for growing businesses with complex supply chain needs.",
        price: "$499",
        duration: "per month",
        featured: true,
        features: [
            "Up to 1,000 inventory items",
            "Advanced order tracking",
            "Priority support",
            "5 warehouse locations",
            "Advanced analytics",
            "API access",
            "Custom integrations",
        ],
    },
    {
        name: "Enterprise",
        description: "For large organizations requiring maximum scalability and support.",
        price: "Custom",
        duration: "contact sales",
        features: [
            "Unlimited inventory items",
            "Global order tracking",
            "24/7 dedicated support",
            "Unlimited warehouse locations",
            "Custom analytics",
            "Priority API access",
            "Custom development",
            "On-premise deployment",
        ],
    },
]

export default function PricingPage() {
    return (
        <div className="relative min-h-screen flex flex-col p-4">
            <div className="absolute mt-20 rounded-3xl inset-0 flex items-start min-h-screen justify-center text-wrap text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[20vw] opacity-10">
                PRICING
            </div>
            <Navbar />

            <main className="flex-grow min-h-[80vh] p-4 mt-4 mb-8 rounded-3xl mx-auto flex flex-col 
            justify-center items-center text-center py-8 relative z-10 w-full max-w-7xl">
                <div className="text-center mb-16 w-full">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 
                    bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600
                     to-gray-900 dark:from-white dark:via-gray-400 dark:to-white p-2">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg sm:text-xl text-center text-muted-foreground max-w-2xl mx-auto px-4">
                        Choose the perfect plan for your business. All plans include a 14-day free trial.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-1 sm:px-4">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.name}
                            className={`relative flex flex-col group hover:scale-[1.02] transition-all
                                  duration-300
                                 ${tier.featured ? "border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10" : ""
                                }`}
                        >
                            {tier.featured && (
                                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit px-4 py-1
                                 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                <CardDescription className="min-h-[3rem]">{tier.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="mb-8">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    <span className="text-muted-foreground ml-2">{tier.duration}</span>
                                </div>
                                <ul className="space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 shrink-0 text-primary mt-0.5">
                                            <Check className="h-5 w-5 text-primary" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href="/register" className="w-full">
                                    <Button className="w-full gap-4 group relative bg-gradient-to-r from-primary
                            hover:from-purple-500 hover:to-primary to-purple-500 transition-all duration-300
                                ease-in-out rounded-lg">
                                        <div className="absolute inset-0 w-2 bg-accent transition-all duration-200 rounded-xl ease-out group-hover:w-full opacity-10"></div>
                                        <span className="relative z-10">{tier.price === "Custom" ? "Contact Sales" : "Get Started"}</span>
                                        <CircleArrowRight className="shrink-0" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-24 text-center px-4">
                    <h2 className="text-2xl font-bold mb-4">Need something different?</h2>
                    <p className="text-muted-foreground mb-8">
                        Contact our sales team for a custom plan tailored to your specific needs.
                    </p>
                    <Link href="/register">
                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-4 group relative hover:bg-primary hover:text-primary-foreground
                            transition-all duration-300 ease-in-out rounded-full py-6"
                        >
                            <div className="absolute inset-0 w-2 bg-accent transition-all duration-500 rounded-xl
                            ease-out group-hover:w-full opacity-10"></div>
                            Contact Sales
                            <CircleArrowRight className="shrink-0" />
                        </Button>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}

