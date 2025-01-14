"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import { Logo } from "@/components/Logo";
import { CircleArrowRight } from "lucide-react";

const LandingPage: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000, // Animation duration in milliseconds
            easing: "ease-out-cubic", // Easing function
            once: true, // Whether animation should happen only once
        });
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col p-4">
            <div data-aos='fade-in' className="absolute inset-0 flex items-center min-h-screen justify-center text-muted-foreground -z-10 font-sans text-left font-black animate-pulse p-4 text-[25vw] opacity-10">SLATE<br />CHAIN</div>
            <Navbar />

            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center py-8 relative z-10 bg-background/75">
                <div data-aos='fade-down' className="mb-4 w-40 h-40">
                    <Logo
                        className="w-full h-full  hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
                    />
                </div>
                {/* Hero Heading */}
                <h1
                    data-aos="fade-up"
                    className="text-5xl font-sans p-4 sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-black dark:from-white via-gray-800 dark:via-gray-200 to-gray-600 dark:to-gray-400 tracking-wide mb-6 drop-shadow-lg"
                >
                    Streamline Your Supply Chain
                </h1>
                {/* Subheading */}
                <p
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="text-xl font-sans md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl mb-8"
                >
                    SlateChain helps you manage your <strong className="italic strong font-sans">inventory</strong>, track orders, and optimize logistics with ease.
                </p>
                {/* Call-to-Action Button */}
                <div data-aos="zoom-in" data-aos-delay="400">
                    <Button
                        size="lg"
                        className="rounded-2xl gap-4 group relative bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-7 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                    >
                        <div className="absolute inset-0 w-0 bg-accent transition-all duration-[250ms] rounded-xl ease-out group-hover:w-full opacity-10"></div>
                        <Link href="/register" className="text-base">Get Started</Link>
                        <CircleArrowRight />
                    </Button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
