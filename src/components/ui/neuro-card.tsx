import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NeuroCardProps {
  children: ReactNode;
  className?: string;
  variant?: "raised" | "inset";
  topBorderColor?: string;
}

export const NeuroCard = ({ 
  children, 
  className, 
  variant = "raised",
  topBorderColor 
}: NeuroCardProps) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl transition-all duration-300",
        variant === "raised" ? "shadow-neuro-raised hover:shadow-[--8px_-8px_16px_hsl(var(--neuro-light)),8px_8px_16px_hsl(var(--neuro-dark))]" : "shadow-neuro-inset",
        "bg-neuro-base",
        topBorderColor && `border-t-[3px]`,
        className
      )}
      style={topBorderColor ? { borderTopColor: topBorderColor } : undefined}
    >
      {children}
    </div>
  );
};
