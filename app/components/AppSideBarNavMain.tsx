import { useLocation, useNavigate, useNavigation, useResolvedPath } from "@remix-run/react"
import clsx from "clsx"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
} from "~/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon 
  }[]
}) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item, item_idx) => {
          const path = useResolvedPath(item.url)
          // const isActive = path.pathname === location.pathname
          // below covers sub paths
          const isActive = location.pathname.includes(path.pathname)
          const isLoading =
            navigation.state === "loading" &&
            navigation.location.pathname === path.pathname &&
            navigation.formData === undefined;

          return (
            <SidebarMenuItem key={item_idx}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                onClick={() => navigate(item.url)}
                className={isLoading ? "animate-pulse duration-500" : ""}
              >
                {item.icon && <item.icon className={clsx("size-4", isActive ? "text-primary" : "")} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
