import { Book, Home, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items: {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
}[] = [
  {
    title: "首页",
    url: "/",
    icon: Home,
    isActive: true,
  },
  {
    title: "知识库",
    url: "/knowledge",
    icon: Book,
  },
]

export function NavMain() {
  const { pathname } = useLocation()

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname === item.url}>
            <Link to={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
