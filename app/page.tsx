"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col p-4">
            <Navbar />
            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center py-8">
                <h1 className="text-5xl font-bold mb-6">Streamline Your Supply Chain</h1>
                <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
                    SlateChain helps you manage your inventory, track orders, and optimize logistics with ease.
                </p>
                <Button asChild size="lg" className="rounded-xl">
                    <Link href="/register">Get Started</Link>
                </Button>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
