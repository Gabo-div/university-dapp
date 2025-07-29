import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ValidationCard from '@/components/validations/ValidationCard';
import { client } from '@/lib/api';
import { useQuery } from '@tanstack/react-query'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_admin/validations')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pending-validations"],
    queryFn: async () => {
      const res = await client.api.admin["pending-validations"].$get();

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.data;
    }
  })

  const validations = data ? data : []

  return <div className="flex flex-col space-y-4">
    <h2 className="text-xl font-bold">
      Validaciones Pendientes
    </h2>
    <section className="grid gap-4">
      {
        validations.map((v) => <ValidationCard data={v} refetch={async () => { await refetch() }} />)
      }
      {!isLoading && !isError && !validations.length ? (
        <Card className="bg-sidebar">
          <CardHeader>
            <CardTitle className="text-center">
              No hay validaciones pendientes.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : null}
      {isLoading ? (
        Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-19" />
        ))
      ) : null}
    </section>
  </div>
}
