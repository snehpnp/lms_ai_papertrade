import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    gradientClass: string;
    className?: string;
}

export const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    gradientClass,
    className
}: StatCardProps) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl h-full border border-white/10 group shadow-lg",
            gradientClass,
            className
        )}>
            {/* Background Animations */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-black/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner group-hover:rotate-12 transition-all duration-500">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        {trend && (
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/10 text-white shadow-sm",
                                trend.isPositive ? "text-emerald-300" : "text-rose-300"
                            )}>
                                {trend.value}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/80 drop-shadow-sm">
                            {title}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter drop-shadow-md group-hover:tracking-normal transition-all duration-500">
                            {value}
                        </h3>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm shadow-sm" />
                        <div className="h-6 w-6 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm shadow-sm" />
                    </div>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">
                        Verified Account
                    </span>
                </div>
            </div>
        </div>
    );
};
