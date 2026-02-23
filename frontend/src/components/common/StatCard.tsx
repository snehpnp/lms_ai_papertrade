import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconColor?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, iconColor }: StatCardProps) => (
  <div className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium mt-2",
              trend.positive ? "text-profit-foreground" : "text-loss-foreground"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
      <div
        className={cn(
          "w-11 h-11 rounded-lg flex items-center justify-center",
          iconColor || "bg-primary/10 text-primary"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
