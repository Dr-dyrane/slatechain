import React, { useEffect } from "react";
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className={cn(
                    "fixed inset-0 bg-black/10 backdrop-blur-sm",
                    isOpen ? "animate-in fade-in-0" : "animate-out fade-out-0"
                )}
                onClick={onClose}
            />
            <div
                className={cn(
                    "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg w-full max-w-sm sm:max-w-lg mx-auto z-50",
                    "border border-gray-200 dark:border-gray-700",
                    "animate-in zoom-in-95 duration-300 ease-out",
                    className
                )}
            >
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
};

