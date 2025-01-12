"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

const Navbar: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <header className="w-full md:container md:mx-auto flex justify-between items-center">
            <Link href="/" className="flex flex-row space-x-2">
                <Logo />
                <div className="text-2xl hidden sm:block font-bold">SlateChain</div>
            </Link>
            <div className="flex flex-row gap-2">
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
    );
};

export default Navbar;
