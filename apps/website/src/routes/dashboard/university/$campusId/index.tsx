import { Link, createFileRoute } from '@tanstack/react-router'
import { LibraryIcon } from 'lucide-react'
import useCampusCareers from '@/hooks/useCampusCareers'
import useCampus from '@/hooks/useCampus'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const Route = createFileRoute('/dashboard/university/$campusId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { campusId } = Route.useParams()

  const { data: campus } = useCampus({ campusId })
  const { data: careers, isLoading } = useCampusCareers({ campusId })

  const careersArr = careers || [];

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
            <BreadcrumbPage>{campus?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="grid grid-cols-1 gap-4">
        {
          careersArr.map((career) => (
            <Link
              key={career.id}
              from={Route.fullPath}
              to="careers/$careerId"
              params={{ careerId: career.id }}
              className="w-full">
              <Card className="bg-sidebar">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LibraryIcon className="size-5" />
                    <span>
                      {career.name}
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
    </div>
  );
}
