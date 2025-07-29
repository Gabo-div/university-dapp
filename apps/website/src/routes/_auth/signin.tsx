import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const Route = createFileRoute("/_auth/signin")({
  component: App,
});

function App() {
  const { auth: { signIn } } = Route.useRouteContext()
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          navigate({ to: "/dashboard" });
        },
        onError: (error) => {
          toast.error(error.error.message || "Error");
        },
      },
    );
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-card text-card-foreground">
      <Card className="w-full max-w-sm py-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-8"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input placeholder="john@doe.com" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Iniciar Sesión</Button>

              <p className="text-center text-sm">
                ¿No tienes cuenta{" "}
                <Link to="/signup" className="underline">
                  Registrase
                </Link>
                ?
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
