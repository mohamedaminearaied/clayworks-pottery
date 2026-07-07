import { cn } from "@/lib/utils";

export function Badge({ children, color, bg, className }) {
  return (
    <span className={cn("inline-flex rounded-full bg-opacity-90 px-3 py-1 text-xs font-semibold", className)} style={{ color, background: bg }}>
      {children}
    </span>
  );
}
