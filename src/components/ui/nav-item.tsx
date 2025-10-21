import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

export const NavItem = ({ to, icon: Icon, label, disabled }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors",
        isActive && "text-primary",
        !disabled && "hover:text-foreground",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-lg bg-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
};

interface NavGroupProps {
  label: string;
  children: React.ReactNode;
}

export const NavGroup = ({ label, children }: NavGroupProps) => (
  <div className="space-y-1">
    <div className="px-3 text-xs font-medium text-muted-foreground/70">
      {label}
    </div>
    {children}
  </div>
);
