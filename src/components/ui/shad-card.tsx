import * as React from "react";
import { cn } from "@/lib/utils";

export const ShadCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl bg-neuro-base shadow-neuro-raised",
        className
      )}
    >
      {children}
    </div>
  );
};

export default ShadCard;
