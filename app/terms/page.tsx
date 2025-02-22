import Navbar from "@/components/marketing/Navbar"
import Footer from "@/components/marketing/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute rounded-3xl inset-0 flex items-center min-h-screen justify-center text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[25vw] opacity-10">
        TERMS
      </div>
      <Navbar />

      <main className="flex-grow bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-4xl px-4 py-24 mx-auto prose dark:prose-invert">
          <h1 className="text-4xl font-bold tracking-tight text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 dark:from-white dark:via-gray-400 dark:to-white">
            Terms of Service
          </h1>

          {[
            {
              title: "1. Acceptance of Terms",
              content:
                "By accessing and using SlateChain's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
            },
            {
              title: "2. Service Description",
              content:
                "SlateChain provides supply chain management solutions including inventory tracking, order management, and logistics optimization. Our services are provided 'as is' and may be updated or modified at any time.",
            },
          ].map((section) => (
            <Card key={section.title} className="mb-8 group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold m-0">{section.title}</h2>
                </div>
                <p className="m-0">{section.content}</p>
              </CardContent>
            </Card>
          ))}

          <div className="space-y-8">
            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activities that occur under your account. Notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <h2 className="text-2xl font-semibold mb-4">4. Data Privacy</h2>
              <p>
                Your use of SlateChain is also governed by our Privacy Policy. By using our services, you consent to our
                collection and use of data as outlined in the Privacy Policy.
              </p>
            </section>

            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <h2 className="text-2xl font-semibold mb-4">5. Service Availability</h2>
              <p>
                While we strive for 99.9% uptime, we do not guarantee uninterrupted access to our services. We reserve
                the right to suspend or terminate services for maintenance or updates.
              </p>
            </section>

            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p>
                All content and materials available through SlateChain, including but not limited to text, graphics,
                website name, code, images and logos are the intellectual property of SlateChain.
              </p>
            </section>

            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p>
                SlateChain shall not be liable for any indirect, incidental, special, consequential or punitive damages
                resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes via
                email or through our service.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

