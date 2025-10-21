import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="relative floating-input">
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-input border-2 border-transparent",
            "transition-all duration-300",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
            "placeholder:text-transparent",
            className
          )}
          placeholder={label}
          onFocus={() => setFocused(true)}
          onBlur={(e) => setFocused(e.target.value === "")}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none",
            focused || props.value || props.defaultValue
              ? "-top-2.5 text-xs bg-background px-2 text-primary font-medium"
              : "top-3 text-muted-foreground"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";
