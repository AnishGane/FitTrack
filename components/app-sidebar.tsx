"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { navItems } from "@/constants"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <Sidebar collapsible="icon"  {...props}>

      <SidebarHeader className="py-4">
        <div className="flex group-data-[collapsible=icon]:justify-center justify-between items-center">

          {/* Collapsed state: show trigger only (no Link wrapper) */}
          <SidebarTrigger
            className="
              hidden
              group-data-[collapsible=icon]:flex
              size-9
              items-center
              justify-center
              rounded-md
              text-foreground
              cursor-pointer
              hover:bg-primary/30"/>

          {/* Expanded state: show Logo Link + Trigger */}
          <Link href="/dashboard"
            className="flex items-center gap-2 font-semibold text-2xl px-2
                      group-data-[collapsible=icon]:hidden">
            <span className="truncate tracking-tight">
              FitTrack
            </span>
          </Link>

          <SidebarTrigger
            className="
        cursor-pointer
        group-data-[collapsible=icon]:hidden
        hover:bg-primary/30"/>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 pt-4">  {/* ← remove default group padding */}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-0"> {/* ← remove menu padding */}
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem
                    key={item.title}

                    className="
                      w-full
                      rounded-md
                      /* collapsed: fill the full 4rem width */
                      group-data-[collapsible=icon]:flex
                      group-data-[collapsible=icon]:items-center
                      group-data-[collapsible=icon]:justify-center
                    "
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}

                      className="
                        h-10 w-full rounded-md px-3 sm:font-medium

                        /* collapsed: full width, centered, no padding */
                        group-data-[collapsible=icon]:w-full!
                        group-data-[collapsible=icon]:h-10!
                        group-data-[collapsible=icon]:p-0!
                        group-data-[collapsible=icon]:flex
                        group-data-[collapsible=icon]:items-center
                        group-data-[collapsible=icon]:justify-center

                        text-sidebar-foreground
                        data-[active=true]:bg-sidebar-primary
                        data-[active=true]:text-sidebar-primary-foreground
                        data-[active=true]:font-semibold
                        hover:bg-sidebar-primary/10
                        hover:text-sidebar-primary
                        data-[active=true]:hover:bg-sidebar-primary/90
                        data-[active=true]:hover:text-sidebar-primary-foreground
                      "
                    >
                      <Link
                        href={item.url}
                        onClick={() => setOpenMobile(false)}
                        className="
                          flex items-center gap-2 py-2.5 w-full h-full px-3

                          /* collapsed: center icon, remove padding */
                          group-data-[collapsible=icon]:justify-center
                          group-data-[collapsible=icon]:px-0
                        "
                      >
                        <item.icon className="size-5 shrink-0" />
                        <span className="text-base group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser image={user?.image ?? ""} name={user?.name ?? ""}
          email={user?.email ?? ""} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}