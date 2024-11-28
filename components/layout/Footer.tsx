"use client";

export function Footer() {
  return (
    <footer className="bg-background hidden md:block text-center py-4">
      <div className="container">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SlateChain. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
