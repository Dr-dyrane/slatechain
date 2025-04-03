"use client";

import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary/75 dark:bg-background/50 backdrop-blur-3xl py-4 rounded-xl md:container md:mx-auto">
            <div className="container mx-auto flex flex-col md:flex-row gap-2 justify-between text-center items-center">
                <p>&copy; 2023 SupplyCycles. All rights reserved.</p>
                <nav>
                    <Link href="/pricing" className="mr-4 hover:underline">
                        Pricing
                    </Link>
                    <Link href="/terms" className="mr-4 hover:underline">
                        Terms
                    </Link>
                    <Link href="/policy" className="hover:underline">
                        Policy
                    </Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
