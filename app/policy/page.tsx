import Navbar from "@/components/marketing/Navbar"
import Footer from "@/components/marketing/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Lock, Bell } from "lucide-react"

const sections = [
  {
    icon: Users,
    title: "1. Information We Collect",
    content:
      "We collect information that you provide directly to us, including account registration, profile information, payment details, and usage data.",
    items: [
      "Account registration information",
      "Profile information",
      "Payment information",
      "Usage data and analytics",
      "Communication preferences",
    ],
  },
  {
    icon: Lock,
    title: "2. Data Security",
    content:
      "The security of your data is important to us. We implement industry-standard security measures to protect your information.",
  },
  {
    icon: Bell,
    title: "3. How We Use Your Information",
    content:
      "We use your information to provide and improve our services, communicate with you, and ensure a personalized experience.",
  },
  // Add more sections as needed
]

export default function PolicyPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute rounded-3xl inset-0 flex items-center min-h-screen justify-center text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[25vw] opacity-10">
        PRIVACY
      </div>
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-4xl px-4 py-24 mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
            Privacy Policy
          </h1>

          <div className="grid gap-8">
            {sections.map((section) => (
              <Card key={section.title} className="group hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">{section.content}</p>
                  {section.items && (
                    <ul className="grid gap-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

