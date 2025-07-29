import { Navigate, Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    if (context.auth.session.data) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();


  if (auth.session.data) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}
