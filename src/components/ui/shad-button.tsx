import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShadButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const ShadButton = React.forwardRef<HTMLButtonElement, ShadButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const sizeMap = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    const variantMap = {
      default: "bg-card text-foreground border",
      primary: "bg-gradient-to-r from-primary to-secondary text-white",
      outline: "border border-border text-foreground bg-transparent",
      ghost: "bg-transparent text-foreground",
    } as Record<string, string>;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-transform focus:outline-none focus:ring-2 focus:ring-ring",
          sizeMap[size],
          variantMap[variant],
          className
        )}
        {...props}
      >
        <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {children}
        </motion.span>
      </button>
    );
  }
);

ShadButton.displayName = "ShadButton";
