import { cn } from "@/lib/utils";
import { T } from "@/lib/theme";

export function ClayBar({ value, max, tone }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = tone === "danger" ? T.rust : tone === "warn" ? T.gold : T.sage;
  return (
    <div className="flex min-w-27.5 items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[#EEE2CC] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="min-w-5.5 text-xs text-[#6B5544] text-right">{value}</span>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm" style={{ borderColor: T.line, backgroundColor: T.paper }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.2px]" style={{ color: T.brownSoft }}>{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ backgroundColor: accent + "22" }}>
          <Icon size={17} color={accent} />
        </div>
      </div>
      <div className="mt-4 font-serif text-3xl font-semibold leading-tight" style={{ color: T.brown }}>{value}</div>
      {sub && <div className="mt-2 text-sm" style={{ color: T.brownSoft }}>{sub}</div>}
    </div>
  );
}

export function DashboardHero({ title, description, actions, icon: Icon }) {
  return (
    <div className="rounded-[28px] border p-6 shadow-sm sm:p-8" style={{ borderColor: T.line, backgroundColor: T.paper }}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: T.clayDeep, backgroundColor: T.creamDeep }}>
            Studio pulse
          </span>
          <h3 className="mt-4 text-2xl font-semibold sm:text-3xl" style={{ color: T.brown }}>{title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: T.brownSoft }}>{description}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px]" style={{ backgroundColor: T.creamDeep, color: T.clay }}>
            <Icon size={24} />
          </div>
          <div className="flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </div>
  );
}

export function MiniMetric({ label, value, note, tone }) {
  const toneStyles =
    tone === "danger"
      ? { backgroundColor: T.rustFaint, color: T.rust }
      : tone === "success"
      ? { backgroundColor: T.sageFaint, color: T.sage }
      : { backgroundColor: T.paper, color: T.brown };

  return (
    <div className={cn("rounded-3xl border p-4 shadow-sm", "border-[#E2D4BC]")} style={{ ...toneStyles, borderColor: T.line, backgroundColor: toneStyles.backgroundColor }}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: T.brownSoft }}>{label}</div>
      <div className="mt-3 text-3xl font-semibold" style={{ color: T.brown }}>{value}</div>
      {note && <div className="mt-2 text-sm" style={{ color: T.brownSoft }}>{note}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold font-serif text-[#3C2A1E]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[#6B5544]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
