import { createRootRouteWithContext, Outlet, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import type useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

interface RouterContext {
  auth: ReturnType<typeof useAuth>
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    const { auth } = Route.useRouteContext()
    const router = useRouter()

    useEffect(() => {
      router.invalidate()

      const unsubscribe = auth.onAuthChange(() => {
        router.invalidate()
      })

      return unsubscribe
    }, [])

    return <>
      <ThemeProvider>
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </>
  }
});
