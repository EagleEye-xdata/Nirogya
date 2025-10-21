import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Loading = ({
  className,
  size = "md",
  fullScreen = false,
  text,
}: LoadingProps) => {
  const Wrapper = fullScreen ? FullScreenWrapper : DefaultWrapper;

  return (
    <Wrapper>
      <div className={cn("flex items-center gap-3", className)}>
        <Loader2 className={cn("animate-spin", sizeMap[size])} />
        {text && <p className="text-muted-foreground animate-pulse">{text}</p>}
      </div>
    </Wrapper>
  );
};

const FullScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    {children}
  </div>
);

const DefaultWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center p-4">{children}</div>
);
