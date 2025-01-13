"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

const LandingPage: React.FC = () => {
    return (
        <div className="relative min-h-screen flex flex-col p-4">
            {/* Video with Masking Effect */}
            <div className="absolute inset-0 -z-10">
                <video
                    className="object-cover w-full h-full opacity-80"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label="A high-quality video showcasing the efficiency of SlateChain in managing supply chains, inventory, and logistics."
                >
                    <source
                        src="hero.mp4"
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-75"></div>
            </div>

            <Navbar />

            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center py-8 relative z-10">
                <h1 className="text-5xl font-bold mb-6 relative z-20">Streamline Your Supply Chain</h1>
                <p className="text-xl mb-8 max-w-2xl relative z-20">
                    SlateChain helps you manage your inventory, track orders, and optimize logistics with ease.
                </p>
                <Button asChild size="lg" className="rounded-xl relative z-20">
                    <Link href="/register" className="text-white">Get Started</Link>
                </Button>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
