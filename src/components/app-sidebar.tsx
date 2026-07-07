import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Flame, LayoutDashboardIcon, Package, Truck, Receipt } from "lucide-react"

export function AppSidebar({ view, setView, session, onLogout, ...props }: {
  view: string
  setView: (view: string) => void
  session: { name: string; email: string; avatar?: string }
  onLogout: () => void
} & React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: session?.name ?? "Studio",
    email: session?.email ?? "studio@example.com",
    avatar: session?.avatar ?? "/avatars/shadcn.jpg",
  }

  const appNavMain = [
    { key: "dashboard", title: "Dashboard", icon: <LayoutDashboardIcon /> },
    { key: "inventory", title: "Inventory", icon: <Package /> },
    { key: "purchases", title: "Purchases", icon: <Truck /> },
    { key: "sales", title: "Sales", icon: <Receipt /> },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="min-w-0 gap-2 rounded-xl px-3 py-2 text-sm font-semibold">
              <Flame className="size-5" />
              <span>Ember & Clay</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={appNavMain} value={view} onChange={setView} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
