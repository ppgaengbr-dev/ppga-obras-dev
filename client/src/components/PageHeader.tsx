import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actionButton,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
    </div>
  );
}
