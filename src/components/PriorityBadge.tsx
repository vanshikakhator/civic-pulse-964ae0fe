import { Badge } from "@/components/ui/badge";

const priorityStyles: Record<string, string> = {
  High: "bg-priority-high/15 text-priority-high border-priority-high/30",
  Medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
  Low: "bg-priority-low/15 text-priority-low border-priority-low/30",
};

const statusStyles: Record<string, string> = {
  Pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  "In Progress": "bg-status-progress/15 text-status-progress border-status-progress/30",
  Resolved: "bg-status-resolved/15 text-status-resolved border-status-resolved/30",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${priorityStyles[priority] || ""}`}>
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${statusStyles[status] || ""}`}>
      {status}
    </Badge>
  );
}
