import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageCardProps {
    children: ReactNode;
    className?: string;
}

export default function PageCard({ children, className }: PageCardProps) {
    return (

        <div> {children}</div>
    );
}
