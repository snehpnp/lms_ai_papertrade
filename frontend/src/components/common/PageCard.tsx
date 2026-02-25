import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageCardProps {
    children: ReactNode;
    className?: string;
}

export default function PageCard({ children, className }: PageCardProps) {
    return (
        <div
            className={cn(
                "bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 min-h-[calc(100vh-8rem)] w-full max-w-full overflow-hidden transition-all duration-300",
                className
            )}
        >
            {children}
        </div>
    );
}
