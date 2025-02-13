import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ElegantLogoProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

export function ElegantLogo({
  className,
  delay = 0,
  width = 100,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: ElegantLogoProps) {
  const { theme } = useTheme();
  const [fillColor, setFillColor] = useState("#000000");

  useEffect(() => {
    setFillColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotate - 15 }}
      animate={{ opacity: 1, scale: 1, rotate: rotate }}
      transition={{ duration: 1.5, delay, ease: "easeInOut" }}
      className={cn("relative flex items-center justify-center", className)}
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <svg
          width={width}
          height={height}
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          fill={fillColor}
          className="transition-all drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
        >
          <g fill={fillColor}>
            <path d="M6 9.714v4.076l9.895 5.715 6.42-3.715v3.315l3.456 2.038V9.714l-9.885 5.715z" />
            <path
              opacity=".7"
              d="M15.886 4L6 9.714v11.429l9.886 5.714 9.857-5.714-3.495-2.038-6.362 3.676-6.39-3.676v-7.353l6.39-3.676 6.362 3.676 3.495-2.038z"
            />
          </g>
        </svg>
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15] dark:border-none",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}
