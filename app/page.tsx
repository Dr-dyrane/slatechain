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
            {/* Video with Masking Effect */}
            {/* <div className="absolute inset-0 -z-10">
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
            </div> */}

            <Navbar />

            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center py-8 relative z-10">
                <div data-aos='fade-down' className="mb-4 w-40 h-40">
                    <Logo
                        className="w-full h-full  hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
                    />
                </div>
                {/* Hero Heading */}
                <h1
                    data-aos="fade-up"
                    className="text-5xl p-4 sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-black dark:from-white via-gray-800 dark:via-gray-200 to-gray-600 dark:to-gray-400 tracking-wide mb-6 drop-shadow-lg"
                >
                    Streamline Your Supply Chain
                </h1>
                {/* Subheading */}
                <p
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl mb-8"
                >
                    SlateChain helps you manage your inventory, track orders, and optimize logistics with ease.
                </p>
                {/* Call-to-Action Button */}
                <div data-aos="zoom-in" data-aos-delay="400">
                    <Button
                        size="lg"
                        className="rounded-xl gap-4 group relative bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
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
