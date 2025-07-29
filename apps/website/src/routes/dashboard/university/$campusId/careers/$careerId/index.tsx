import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import useCampus from '@/hooks/useCampus'
import useCareer from '@/hooks/useCareer'
import useCareerPensums from '@/hooks/useCareerPensums'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LibraryIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const Route = createFileRoute(
  '/dashboard/university/$campusId/careers/$careerId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { campusId, careerId } = Route.useParams()

  const { data: campus } = useCampus({ campusId })
  const { data: career } = useCareer({ careerId })
  const { data: pensums, isLoading, isError } = useCareerPensums({ careerId })

  const pensumsArr = pensums || [];

  return (
    <div className="flex flex-col space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="/dashboard/university">
                Universidad
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../..">
                {campus?.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{career?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="grid grid-cols-1 gap-4">
        {!isLoading && !isError && !pensumsArr.length ? (
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="text-center">
                No hay pensums disponibles para esta carrera.
              </CardTitle>
            </CardHeader>
          </Card>
        ) : null}
        {
          pensumsArr.map((pensum) => (
            <Link
              key={pensum.id}
              from={Route.fullPath}
              to="pensums/$pensumId"
              params={{
                pensumId: pensum.id
              }}
              className="w-full">
              <Card className="bg-sidebar">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LibraryIcon className="size-5" />
                    <span>
                      Pensum
                      {" "}
                      {pensum.id}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))
        }
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-19" />
          ))
        ) : null}
      </section>
    </div>)
}
