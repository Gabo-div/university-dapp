import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form';
import * as  z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar as CalendarIcon, InfoIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import useUserInfo from '@/hooks/useUserInfo';
import { useEffect } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import useCampuses from '@/hooks/useCampuses';
import useCampusCareers from '@/hooks/useCampusCareers';

export const Route = createFileRoute('/dashboard/register')({
  component: RouteComponent,
})

const formSchema = z.object({
  firstName: z.string({ message: "El nombre es requerido" }).trim().min(1, "El nombre es requerido"),
  middleName: z.string().optional(),
  lastName: z.string({ message: "El apellido es requerido" }).trim().min(1, "El apellido es requerido"),
  secondLastName: z.string().optional(),
  phoneNumber: z.string({ message: "Debe ingresar un número de teléfono válido" }).regex(/^\+?[1-9]\d{1,14}$/, "Debe ingresar un número de teléfono válido"),
  address: z.string({ message: "La dirección es requerida" }).min(1, "La dirección es requerida"),
  sex: z.union([z.literal("M", { message: "Debe selecionar un sexo" }), z.literal("F", { message: "Debe selecionar un sexo" })]),
  birthDate: z.date({ message: "Debe seleccionar una fecha de nacimiento" }),
  birthCountry: z.string({ message: "El país de nacimiento es requerido" }).min(1, "El país de nacimiento es requerido"),
  birthState: z.string({ message: "El estado de nacimiento es requerido" }).min(1, "El estado de nacimiento es requerido"),
  birthCity: z.string({ message: "La ciudad de nacimiento es requerida" }).min(1, "La ciudad de nacimiento es requerida"),
  campusId: z.string({ message: "La sede es requerida" }).min(1, "La sede es requerida"),
  careerId: z.string({ message: "La carrera es requerida" }).min(1, "La carrera es requerida"),
});

function RouteComponent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      phoneNumber: "",
      address: "",
      sex: "" as "M",
      birthDate: undefined,
      birthCountry: "",
      birthState: "",
      birthCity: "",
      campusId: "",
      careerId: "",
    }
  });

  const { auth: { session } } = Route.useRouteContext();

  const { data, refetch } = useUserInfo({ userId: session.data?.user.id });
  const { data: campuses } = useCampuses()
  const { data: careers } = useCampusCareers({ campusId: form.watch("campusId") })

  const campusesArr = campuses ? campuses.pages.flatMap((page) => page.campuses) : [];
  const careersArr = careers || [];

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!session.data) {
        throw new Error("No session data available");
      }

      const options = {
        param: {
          id: session.data.user.id
        },
        json: values
      }

      const res = await (!data ? client.api.users[":id"].info.$post(options) : client.api.users[":id"].info.$put(options));

      const resultData = await res.json();

      if (!res.ok || "error" in resultData) {
        throw Error(`Response error: ${resultData}`);
      }

      return resultData.data;
    },
    onSuccess: (data) => {
      toast.success("Información modificada con éxito");
      form.reset({
        ...data,
        middleName: data.middleName || undefined,
        secondLastName: data.secondLastName || undefined,
        sex: data.sex ? "M" : "F",
        birthDate: new Date(data.birthDate),
      })
      refetch();
    },
    onError: () => {
      toast.error("Error al actualizar tu información");
    }
  })

  useEffect(() => {
    if (!data) {
      return
    }

    form.reset({
      ...data,
      middleName: data.middleName || "",
      secondLastName: data.secondLastName || "",
      sex: data.sex ? "M" : "F",
      birthDate: new Date(data.birthDate),
    })
  }, [data])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values)
  };

  return (<main className="gap space-y-8">
    <section className="flex flex-col">
      <h2 className="font-bold text-xl">Registro</h2>
      <p className="text-sm mb-4 text-muted-foreground">
        Completa tu información personal para que tu registro pueda ser validado.
      </p>

      {data && !data.verified ? (
        <Alert variant="destructive" className="mb-4">
          <InfoIcon />
          <AlertTitle>
            Tu cuenta está pendiente de verificación
          </AlertTitle>
          <AlertDescription>
            Una vez que tu cuenta sea verificada, podrás acceder a todas las funcionalidades del sistema.
          </AlertDescription>
        </Alert>
      ) : null}

      {data && data.verified ?
        (<Alert className="mb-4">
          <InfoIcon />
          <AlertTitle>
            Tu cuenta ya está verificada
          </AlertTitle>
          <AlertDescription>
            Puedes actualizar tu información personal en cualquier momento y esta será revisada nuevamente por el equipo de administración.
          </AlertDescription>
        </Alert>) : null
      }

      <article className="bg-card text-card-foreground rounded-lg p-8 border">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-8"
            autoComplete="off"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segundo Nombre</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segundo Apellido</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Telefono</FormLabel>
                  <FormControl>
                    <Input  {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Indica tu sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "P")
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="birthCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pais de nacimiento</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de nacimiento</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad de nacimiento</FormLabel>
                    <FormControl
                    >
                      <Input{...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="campusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sede</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una sede" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campusesArr.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>{campus.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una carrera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {careersArr.map((career) => (
                          <SelectItem key={career.id} value={career.id}>{career.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={!form.formState.isDirty}>Confirmar</Button>
          </form>
        </Form>
      </article>
    </section>
  </main>
  )
}
