import { Link, createFileRoute } from "@tanstack/react-router";
import { BuildingIcon } from "lucide-react";
import useCampuses from "@/hooks/useCampuses";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/university/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useCampuses()

  const campuses = data ? data.pages.flatMap((page) => page.campuses) : [];

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-bold">
        Información de la Universidad
      </h2>
      <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {
          campuses.map((campus) => (
            <Link to="/dashboard/university/$campusId" params={{ campusId: campus.id }} key={campus.id}>
              <Card className="bg-sidebar">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingIcon className="size-5" />
                    {campus.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))
        }
        {isLoading || isFetchingNextPage ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-19" />
          ))
        ) : null}
      </section>
      <div className="flex justify-center">
        {
          hasNextPage ? (
            <Button
              onClick={() => fetchNextPage()}
              disabled={isLoading || isFetchingNextPage}
              className="btn btn-primary"
            >
              Cargar más
            </Button>
          ) : null
        }

      </div>
    </div>
  );
}
