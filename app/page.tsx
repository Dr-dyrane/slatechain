"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from 'lucide-react';


export default function LandingPage() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="min-h-screen flex flex-col p-4">
            <header className="w-full md:container md:mx-auto flex justify-between items-center">
                <Link href="/" className="flex flex-row space-x-2">
                    <Logo />
                    <div className="text-2xl hidden sm:block font-bold">SlateChain</div>
                </Link>
                <div className='flex flex-row gap-2'>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        aria-label="Toggle theme"
                    >
                        <SunIcon className="h-5 w-5 dark:hidden" />
                        <MoonIcon className="h-5 w-5 hidden dark:block" />
                    </Button>
                    <nav>
                        <Button asChild variant="ghost" className="mr-4">
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Sign Up</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center py-8">
                <h1 className="text-5xl font-bold mb-6">Streamline Your Supply Chain</h1>
                <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
                    SlateChain helps you manage your inventory, track orders, and optimize logistics with ease.
                </p>
                <Button asChild size="lg" className='rounded-xl'>
                    <Link href="/register">Get Started</Link>
                </Button>
            </main>

            <footer className="bg-secondary py-4 rounded-md md:container md:mx-auto">
                <div className="container mx-auto flex flex-col md:flex-row gap-2 justify-between text-center items-center">
                    <p>&copy; 2023 SlateChain. All rights reserved.</p>
                    <nav>
                        <Link href="/pricing" className="mr-4 hover:underline">Pricing</Link>
                        <Link href="/terms" className="mr-4 hover:underline">Terms</Link>
                        <Link href="/policy" className="hover:underline">Policy</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}

