import { LayoutGrid, Package, Truck, Receipt, Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_INFO } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Sidebar({ view, setView, lowStockCount, session, onLogout }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "purchases", label: "Purchases", icon: Truck },
    { key: "sales", label: "Sales", icon: Receipt },
  ];
  const roleInfo = ROLE_INFO[session.role] || ROLE_INFO.Employee;

  return (
    <div className="flex w-full flex-col gap-5 bg-[#3C2A1E] px-4 py-6 text-[#FFFCF6] md:w-65 md:px-5 md:py-7">
      <div className="flex items-center gap-2 overflow-hidden px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[0.6rem] bg-[#C1622B]">
          <Flame size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-serif text-base font-semibold leading-tight">Ember & Clay</div>
          <div className="text-[0.65rem] text-[#BBA98F]">Studio console</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[0.7rem] px-3 py-3 text-sm font-semibold transition",
                active ? "bg-[#C1622B] text-[#FFFCF6]" : "bg-transparent text-[#E4D6BE] hover:bg-white/10"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </span>
              {key === "inventory" && lowStockCount > 0 && (
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold",
                  active ? "bg-[#FFFCF6] text-[#93481D]" : "bg-[#9C3B2A] text-[#FFFCF6]"
                )}>
                  {lowStockCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3 rounded-[0.7rem] bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E4D6BE] text-[#3C2A1E] text-[0.7rem] font-bold">
            {session.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#FFFCF6]">{session.name}</div>
            <Badge color={roleInfo.color} bg={roleInfo.bg}>{session.role}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-[#BBA98F] hover:bg-white/10" onClick={onLogout}>
          <LogOut size={15} /> Sign out
        </Button>
      </div>
    </div>
  );
}
