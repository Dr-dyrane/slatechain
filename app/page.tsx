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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background to-background opacity-70"></div>
            </div>

            <Navbar />

           
            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center py-8 relative z-10">
                {/* Hero Heading */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-black dark:from-white via-gray-800 dark:via-gray-200 to-gray-600 dark:to-gray-400 tracking-wide mb-6 drop-shadow-lg animate-fade-in">
                    Streamline Your Supply Chain
                </h1>
                {/* Subheading */}
                <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl mb-8 animate-fade-in">
                    SlateChain helps you manage your inventory, track orders, and optimize logistics with ease.
                </p>
                {/* Call-to-Action Button */}
                <Button
                    asChild
                    size="lg"
                    className="rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                >
                    <Link href="/register">Get Started</Link>
                </Button>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
