import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-black tracking-tight text-foreground leading-none">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground font-medium mt-1">{subtitle}</p>}
    </div>
    {action && <div className="animate-fade-in">{action}</div>}
  </div>
);

export default PageHeader;
