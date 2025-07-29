import { client } from "@/lib/api"
import { type InferResponseType } from "hono/client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { useMutation } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import useCampus from "@/hooks/useCampus";
import useCareer from "@/hooks/useCareer";

const _res = client.api.admin["pending-validations"].$get

type Props = {
  data: Extract<InferResponseType<typeof _res>, Record<any, any>>["data"][0]
  refetch: () => Promise<void>
}
const roles = [
  { value: 0, label: "Estudiante" },
  { value: 1, label: "Profesor" },
  { value: 2, label: "Coordinador de Pregrado" },
  { value: 3, label: "Coordinador de Postgrado" },
  { value: 4, label: "Coordinador de Carrera" },
  { value: 5, label: "Administrator" },
]

export enum UserRole {
  Student = 0,
  Professor = 1,
  PregradeCoordinator = 2,
  PostgradeCoordinator = 3,
  CareerCoordinator = 4,
  Administrator = 5,
}

const formSchema = z.object({
  roles: z.array(z.number()).refine((value) => value.length && value.every((item) => roles.some((r) => r.value === item)), {
    message: "Tiene que seleccionar al menos un rol.",
  }),
  password: z.string().min(1, "La contraseña es requerida.")
})

export default function ValidationCard({ data: v, refetch }: Props) {
  const { data: campus } = useCampus({ campusId: v.userInfo.campusId })
  const { data: career } = useCareer({ careerId: v.userInfo.careerId })

  const { mutate } = useMutation({
    mutationFn: async ({ roles, password }: { roles: UserRole[], password: string }) => {
      const res = await client.api.users[":id"].validate.$post({
        param: {
          id: v.user.id,
        }, json: {
          roles,
          // @ts-expect-error
          password
        }
      })

      const resultData = await res.json();

      if (!res.ok || "error" in resultData) {
        throw Error(`Response error: ${resultData}`);
      }

      return resultData.data;
    },
    onSuccess: () => {
      toast.success("Usuario verificado con éxito");
      refetch();
    },
    onError: () => {
      toast.error("Error al verificar el usuario");
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roles: [],
      password: "",
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate({ roles: data.roles, password: data.password })
  }

  return (
    <Card className="bg-sidebar">
      <Collapsible>
        <CardHeader className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              {v.user.name}
            </CardTitle>
            <CardDescription>
              {v.user.email}
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button size="icon">
              <ChevronDownIcon />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <Separator className="my-4" />
            <div
              className="flex flex-col space-y-8"
            >
              <div className="grid grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input value={v.userInfo.firstName} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Segundo Nombre</Label>
                  <Input value={v.userInfo.middleName || ""} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Apellido</Label>
                  <Input value={v.userInfo.lastName} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Segundo Apellido</Label>
                  <Input value={v.userInfo.secondLastName || ""} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Número de Telefono</Label>
                  <Input value={v.userInfo.phoneNumber} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Sexo</Label>
                  <Input value={v.userInfo.sex ? "Masculino" : "Femenino"} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Fecha de nacimiento</Label>
                  <Input value={format(v.userInfo.birthDate, "P")} readOnly />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Dirección</Label>
                <Textarea
                  value={v.userInfo.address}
                  rows={2}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="grid gap-2">
                  <Label>Pais de nacimiento</Label>
                  <Input value={v.userInfo.birthCountry} readOnly
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Estado de nacimiento</Label>
                  <Input value={v.userInfo.birthState} readOnly />
                </div>

                <div className="grid gap-2">
                  <Label>Ciudad de nacimiento</Label>
                  <Input value={v.userInfo.birthCity} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="grid gap-2">
                  <Label>Sede</Label>
                  <Input value={campus ? campus.name : ""} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label>Carrera</Label>
                  <Input value={career ? career.name : ""} readOnly />
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="roles"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Roles</FormLabel>
                        <FormDescription>
                          Selecciona que roles se le asignaran al nuevo usuario.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {roles.map((role) => (
                          <FormField
                            key={role.value}
                            control={form.control}
                            name="roles"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role.value}
                                  className="flex flex-row items-center gap-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, role.value])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== role.value
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {role.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <div className="grid grid-cols-2 gap-2">
                  <Button role="button" variant="outline">Rechazar</Button>
                  <Button type="submit">Validar</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

