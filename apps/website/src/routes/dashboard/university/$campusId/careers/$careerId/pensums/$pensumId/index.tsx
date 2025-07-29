import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useCampus from '@/hooks/useCampus'
import useCareer from '@/hooks/useCareer'
import usePensum from '@/hooks/usePensum'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const Route = createFileRoute(
  '/dashboard/university/$campusId/careers/$careerId/pensums/$pensumId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { campusId, careerId, pensumId } = Route.useParams()

  const { data: campus } = useCampus({ campusId })
  const { data: career } = useCareer({ careerId })
  const { data: pensum } = usePensum({ pensumId })


  const subjectsBySemester = !pensum ? {} : pensum.subjects.reduce((acc, subject) => {
    const semester = subject.semester;
    if (!acc[semester]) {
      acc[semester] = {
        subjects: [],
        uc: 0,
      };
    }
    acc[semester].subjects.push(subject);
    acc[semester].uc += subject.credits;
    return acc;
  }, {} as Record<number, { subjects: typeof pensum.subjects, uc: number }>);

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
              <Link from={Route.fullPath} to="../../../..">
                {campus?.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../..">
                {career?.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pensum{" "}{pensum?.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="grid grid-cols-1 gap-4">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-card text-card-foreground">
              <TableRow>
                <TableHead className="text-center font-bold">Código</TableHead>
                <TableHead className="font-bold">Asignatura</TableHead>
                <TableHead className="text-center font-bold">Semestre</TableHead>
                <TableHead className="text-center font-bold">UC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(subjectsBySemester).map(([semester, { uc, subjects }]) => {
                return (
                  <Fragment key={semester}>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="text-center">{subject.id}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell className="text-center">{subject.semester}</TableCell>
                        <TableCell className="text-center">{subject.credits}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={6} className="bg-card text-card-foreground text-center font-bold">
                        Semestre {semester}
                        {" "}
                        - {uc} UC
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>)
}
