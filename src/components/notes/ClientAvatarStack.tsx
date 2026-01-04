import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ClientAvatarStackItem {
  id: string;
  full_name: string;
}

export interface ClientAvatarStackProps {
  clients: ClientAvatarStackItem[];
  max?: number;
  size?: number; // px
  className?: string;
}

const COLORS = [
  "bg-sage-light/60 text-primary",
  "bg-sky-light/50 text-sky",
  "bg-amber-100 text-amber-700",
  "bg-muted text-muted-foreground",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function ClientAvatarStack({
  clients,
  max = 3,
  size = 28,
  className,
}: ClientAvatarStackProps) {
  const visible = clients.slice(0, max);
  const remaining = Math.max(0, clients.length - visible.length);

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((c, idx) => {
        const color = COLORS[idx % COLORS.length];
        return (
          <div
            key={c.id}
            className={cn(
              "rounded-full ring-2 ring-background",
              idx === 0 ? "" : "-ml-2"
            )}
            style={{ width: size, height: size }}
            title={c.full_name}
          >
            <Avatar className="h-full w-full">
              <AvatarFallback className={cn("text-[10px] font-bold", color)}>
                {initials(c.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      })}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full ring-2 ring-background -ml-2",
            "bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold"
          )}
          style={{ width: size, height: size }}
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}


