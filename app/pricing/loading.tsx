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
    price: "$29",
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
    price: "$99",
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
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute rounded-3xl inset-0 flex items-center min-h-screen justify-center text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[25vw] opacity-10">
        PRICING
      </div>
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-background to-secondary/20">
        <div className="container px-4 py-24 mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white animate-gradient-x">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col group hover:scale-105 transition-all duration-300 ${
                  tier.featured ? "border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10" : ""
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-8">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">{tier.duration}</span>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register" className="w-full">
                    <Button className="w-full gap-4 group relative bg-gradient-to-r from-primary hover:from-purple-500 hover:to-primary to-purple-500">
                      <div className="absolute inset-0 w-2 bg-accent transition-all duration-200 rounded-xl ease-out group-hover:w-full opacity-10"></div>
                      {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                      <CircleArrowRight />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold mb-4">Need something different?</h2>
            <p className="text-muted-foreground mb-8">
              Contact our sales team for a custom plan tailored to your specific needs.
            </p>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="gap-4 group relative hover:bg-primary hover:text-primary-foreground"
              >
                <div className="absolute inset-0 w-2 bg-accent transition-all duration-200 rounded-xl ease-out group-hover:w-full opacity-10"></div>
                Contact Sales
                <CircleArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

