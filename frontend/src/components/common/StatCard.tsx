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
  <div className="stat-card">
    <div className="flex flex-col gap-1">
      <p className="stat-label">{title}</p>
      <p className="stat-value text-card-foreground">{value}</p>
      {trend && (
        <p
          className={cn(
            "text-xs font-bold mt-1",
            trend.positive ? "text-profit" : "text-loss"
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
    <div
      className={cn(
        "stat-icon",
        iconColor
      )}
    >
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

export default StatCard;
