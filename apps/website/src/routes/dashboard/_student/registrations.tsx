import { client } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/dashboard/_student/registrations')({
  component: RouteComponent,
})

const formSchema = z.object({
  subjectsId: z.string().array().min(1, { message: "Debe seleccionar al menos una asignatura." }),
  password: z.string().min(1, "La contraseña es requerida.")
})

function RouteComponent() {
  const { auth: { session } } = Route.useRouteContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectsId: [],
      password: "",
    },
  })

  const { data: subjects, refetch } = useQuery({
    queryKey: ["student-subjects-options"],
    queryFn: async () => {
      if (!session.data) {
        throw Error("User is required");
      }

      const res = await client.api.student[":id"]["subjects-options"].$get(
        {
          param: {
            id: session.data.user.id
          }
        }

      );

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.data;
    }
  })

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session.data) {
        throw new Error("No session data available");
      }

      const res = await client.api.student["register-subjects"].$post({
        // @ts-expect-error
        json: values
      });

      const resultData = await res.json();

      if (!res.ok || "error" in resultData) {
        throw Error(`Response error: ${resultData}`);
      }

      return resultData.data;
    },
    onSuccess: () => {
      toast.success("Asignaturas registradas con éxito");
      refetch();
    },
    onError: () => {
      toast.error("Error al registrar las asignaturas");
    }
  })

  const [selecteds, setSelecteds] = useState<Record<string, boolean>>({})

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data)
  }

  useEffect(() => {
    form.setValue("subjectsId", Object.entries(selecteds).filter(([_, value]) => !!value).map(([key]) => key))
  }, [selecteds])

  const selectedsCount = Object.values(selecteds).filter((s) => !!s).length
  const selectedsUC = subjects ? subjects.reduce((a, b) => a + (selecteds[b.id] ? b.credits : 0), 0) : 0

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl font-bold">
        Inscripción de Asignaturas
      </h2>
      <section>
        <div>
          <span className="font-bold">Asignaturas seleccionadas: {" "}</span>
          {selectedsCount}
        </div>
        <div>
          <span className="font-bold">UC Permitidas: {" "}</span>
          26
        </div>
        <div>
          <span className="font-bold">UC Seleccionadas: {" "}</span>
          {selectedsUC}
        </div>
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section className="grid grid-cols-1 gap-4">
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-card text-card-foreground">
                  <TableRow>
                    <TableHead className="text-center font-bold">Código</TableHead>
                    <TableHead className="font-bold">Asignatura</TableHead>
                    <TableHead className="text-center font-bold">Semestre</TableHead>
                    <TableHead className="text-center font-bold">UC</TableHead>
                    <TableHead className="text-center font-bold">Inscribir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects ? subjects.map((subject) => (
                    <TableRow key={subject.id} className={cn("transition-colors", selecteds[subject.id] && "bg-muted hover:bg-muted")}>
                      <TableCell className="text-center">{subject.id}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell className="text-center">{subject.semester}</TableCell>
                      <TableCell className="text-center">{subject.credits}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox checked={selecteds[subject.id]} onCheckedChange={(c) => setSelecteds({ ...selecteds, [subject.id]: !!c })} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : null}
                </TableBody>
              </Table>
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormDescription>
                    Confirma tu contraseña para realizar esta acción.
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="************"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex">
              <Button className="ml-auto"
              >Confirmar</Button>
            </div>
          </section>
        </form>
      </Form>
    </div>
  )
}
