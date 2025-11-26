import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FloatingActionButtonProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export const FloatingActionButton = ({ onClick, children, className }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 md:bottom-8 right-6 z-40",
        "w-14 h-14 rounded-full",
        "bg-gradient-to-br from-primary to-accent",
        "text-white shadow-lg",
        "flex items-center justify-center",
        "hover:scale-110 active:scale-95",
        "transition-all duration-300",
        "animate-bounce-in",
        "hover:shadow-2xl hover:shadow-primary/50",
        className
      )}
    >
      {children}
    </button>
  );
};
