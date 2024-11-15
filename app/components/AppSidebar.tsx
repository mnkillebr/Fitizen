import * as React from "react"
import { type LucideIcon } from "lucide-react"
// import { ArrowLeftEndOnRectangleIcon, Bars3Icon, BookOpenIcon, CalendarIcon, FireIcon, TableCellsIcon } from "@heroicons/react/24/solid";
// import { ChartIcon } from "images/icons";
import { NavMain } from "~/components/AppSideBarNavMain"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "~/components/AppSidebarNavUser"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import { SidebarSearchForm } from "./AppSidebarSearch"
import { SidebarHeaderButton } from "./AppSidebarHeader"
import { User } from "@prisma/client";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
  // darkModeEnabled: boolean;
  navLinks: {
    title: string
    url: string
    icon?: LucideIcon 
  }[]
}

export function AppSidebar({ navLinks, user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarHeaderButton />
        <SidebarSearchForm />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navLinks} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: `${user.firstName} ${user.lastName}`,
          initials: `${user.firstName[0]}${user.lastName[0]}`,
          email: user.email,
          avatar: user.profilePhotoUrl ?? "",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
