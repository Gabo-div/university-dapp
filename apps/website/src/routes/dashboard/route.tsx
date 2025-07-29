import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  Navigate,
} from "@tanstack/react-router";
import {
  CheckCircleIcon,
  ClipboardListIcon,
  DatabaseIcon,
  GraduationCapIcon,
  IdCardIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/dashboard/NavGroup";
import { NavUser } from "@/components/dashboard/NavUser";
import { NavSecondary } from "@/components/dashboard/NavSecondary";
import useUserRoles from "@/hooks/useUserRoles";

const entries = {
  navMain: [
    {
      title: "Inicio",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Billetera",
      url: "/dashboard/wallet",
      icon: WalletIcon,
    },
    {
      title: "Universidad",
      url: "/dashboard/university",
      icon: DatabaseIcon,
    },
    {
      title: "Registro",
      url: "/dashboard/register",
      icon: IdCardIcon,
    },
  ],
  navAdmin: [
    {
      title: "Validaciones",
      url: "/dashboard/validations",
      icon: CheckCircleIcon,
    },
  ],
  navStudent: [
    {
      title: "Inscripciones",
      url: "/dashboard/registrations",
      icon: ClipboardListIcon
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "/dashboard",
      icon: SettingsIcon,
    },
  ],
};

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    const { session } = context.auth

    if (!session.data && !session.isPending) {
      throw redirect({ to: "/signin" });
    }

  },
  component: RouteComponent,
});

function RouteComponent() {
  const { auth: { session, signOut } } = Route.useRouteContext();
  const { data } = useUserRoles({ userId: session.data?.user.id })

  if (session.isPending) {
    return "Cargando..."
  }

  if (!session.data && !session.isPending) {
    return <Navigate to="/signin" />;
  }

  if (!session.data) {
    return null
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link to="/dashboard">
                  <GraduationCapIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">UDAPP</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup
            active
            label="Principal"
            items={entries.navMain} />
          <NavGroup
            active={data && data.includes("Administrator")}
            label="Administrador"
            items={entries.navAdmin} />
          <NavGroup
            active={data && data.includes("Estudiante")}
            label="Estudiante"
            items={entries.navStudent} />
          <NavSecondary items={entries.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            signOut={signOut}
            user={{
              name: session.data.user.name,
              email: session.data.user.email,
              avatar: session.data.user.image || "",
            }}
          />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 md:px-8 flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
