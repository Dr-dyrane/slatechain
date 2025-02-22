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
import { Pacifico } from "next/font/google";
import { cn } from "@/lib/utils";
import { ElegantLogo } from "@/components/ElegantLogo";

const pacifico = Pacifico({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-pacifico",
})

const LandingPage: React.FC = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000, // Animation duration in milliseconds
            easing: "ease-out-cubic", // Easing function
            once: true, // Whether animation should happen only once
        });
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col p-4 group">
            <div data-aos='fade-in' className="absolute rounded-3xl inset-0 flex items-center min-h-screen justify-center text-muted-foreground/15 -z-10 font-sans text-left font-black animate-pulse p-4 text-[25vw] opacity-10
            group-hover:opacity-100 group-hover:scale-110 transition-all ease-in-out
            ">SLATE<br />CHAIN</div>
            <Navbar />

            <main className="flex-grow container min-h-[80vh] my-8 rounded-3xl mx-auto flex flex-col justify-center items-center text-center py-8 relative z-10">
                <div className="absolute inset-0 blur-3xl rounded-3xl
  bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.05] 
  dark:from-indigo-900/[0.1] dark:via-transparent dark:to-purple-900/[0.1]" />
                <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-75">
                    <ElegantLogo
                        delay={0.3}
                        width={600}
                        height={140}
                        rotate={12}
                        gradient="from-indigo-500/[0.15]"
                        className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                    />

                    <ElegantLogo
                        delay={0.5}
                        width={500}
                        height={120}
                        rotate={-15}
                        gradient="from-purple-500/[0.15]"
                        className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                    />

                    <ElegantLogo
                        delay={0.4}
                        width={300}
                        height={80}
                        rotate={-8}
                        gradient="from-violet-500/[0.15]"
                        className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                    />

                    <ElegantLogo
                        delay={0.6}
                        width={200}
                        height={60}
                        rotate={20}
                        gradient="from-amber-500/[0.15]"
                        className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                    />

                    <ElegantLogo
                        delay={0.7}
                        width={150}
                        height={40}
                        rotate={-25}
                        gradient="from-cyan-500/[0.15]"
                        className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                    />
                </div>
                <div data-aos='fade-down' className="mb-4 w-40 h-40">
                    <Logo
                        className="w-full h-full  hover:drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
                    />
                </div>
                {/* Hero Heading */}
                <h1
                    data-aos="fade-up"
                    className="text-5xl font-sans p-4 sm:text-6xl md:text-7xl font-extrabold text-transparent 
                                bg-clip-text bg-gradient-to-r from-black dark:from-white via-gray-800 dark:via-gray-200 
                                to-gray-600 dark:to-gray-400 tracking-wide mb-6 drop-shadow-lg transition-all duration-500 
                                hover:scale-105 hover:drop-shadow-2xl animate-gradient-glow"
                >
                    Streamline Your Supply Chain
                </h1>

                {/* Subheading */}
                <p
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="text-xl font-light font-sans md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl mb-8"
                >
                    SlateChain helps you manage your
                    <strong
                        className={cn("italic text-4xl font-sans bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text transition-all duration-300 hover:scale-105 hover:brightness-125 dark:from-blue-400 dark:via-teal-400 dark:to-green-400 animate-glow", pacifico.className,)}
                    >
                        {' '}inventory
                    </strong>, track orders, and optimize logistics with ease.
                </p>

                {/* Call-to-Action Button */}
                <div>
                    <Link href="/register" className="text-lg">
                        <Button
                            size="lg"
                            className="rounded-2xl z-[100] gap-4 group relative bg-gradient-to-r from-primary hover:from-purple-500 hover:to-primary to-purple-500 text-white px-8 py-7 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
                        >
                            <div className="absolute inset-0 w-2 bg-accent transition-all duration-200 rounded-xl ease-out group-hover:w-full opacity-10"></div>
                            Get Started
                            <CircleArrowRight />
                        </Button>
                    </Link>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-3xl 
  bg-gradient-to-t from-white/50 via-transparent to-white/30 
  dark:from-[#030303]/50 dark:via-transparent dark:to-[#030303]/30" />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
