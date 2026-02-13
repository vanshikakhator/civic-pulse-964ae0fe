import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  variant?: "default" | "accent" | "warning" | "danger";
}

const variantClasses = {
  default: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-priority-medium/10 text-priority-medium",
  danger: "bg-destructive/10 text-destructive",
};

export function StatCard({ title, value, icon: Icon, subtitle, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-display font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && <p className="text-xs text-accent font-medium mt-1">{trend}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${variantClasses[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
