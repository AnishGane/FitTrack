import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full p-4">
                <SidebarTrigger className="sm:hidden cursor-pointer hover:bg-sidebar-primary/80 hover:text-white" />
                {children}
            </main>
        </SidebarProvider>
    )
}



