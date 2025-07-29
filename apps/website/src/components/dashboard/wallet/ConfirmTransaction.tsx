import { formatEther } from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useUSDPrice from "@/hooks/useUSDPrice";
import { ethToUsd } from "@/lib/converters";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
  transaction: {
    address: string;
    amount: string;
    total: string;
  };
}

const formSchema = z.object({
  password: z.string().min(1, "Introduce tu contraseña"),
});

export default function ConfirmTransaction({
  transaction,
  onCancel,
  onSuccess,
}: Props) {
  const { data: usdData } = useUSDPrice();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", { address: transaction.address }],
    queryFn: async () => {
      const address = transaction.address;

      const res = await client.api.users.$get({
        query: address.includes("@")
          ? {
            email: address,
          }
          : {
            wallet: address,
          },
      });

      return await res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      password,
      address,
    }: {
      password: string;
      address: string;
    }) => {
      return await client.api.transactions.$post({
        json: {
          password,
          address,
          amount: transaction.amount,
        },
      });
    },
    onSettled: (res) => {
      if (res && res.ok) {
        toast.success("Transacción confirmada");
        onSuccess();
        return;
      }

      toast.error("Error al confirmar la transacción");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isLoading || isError) return;

    let address: string = transaction.address;

    if (
      transaction.address.includes("@") &&
      data?.data.length &&
      data.data[0].wallet
    ) {
      address = data.data[0].wallet;
    }

    if (address.includes("@")) {
      return;
    }

    mutation.mutate({ password: values.password, address });
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <div>
          <p className="font-bold text-sm">Dirección</p>
          <p className="text-sm text-muted-foreground">{transaction.address}</p>
        </div>
        <div>
          <p className="font-bold text-sm">Cantidad</p>
          <p className="text-sm text-muted-foreground">
            {formatEther(BigInt(transaction.amount))} ETH
          </p>
        </div>
        <div>
          <p className="font-bold text-sm">Total</p>
          <p className="text-sm text-muted-foreground">
            {formatEther(BigInt(transaction.total))} ETH
          </p>
        </div>
        <div>
          <p className="font-bold text-sm">Total (USD)</p>
          <p className="text-sm text-muted-foreground">
            {ethToUsd(usdData.data.price, transaction.total)} USD
          </p>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg p-8">
        {isLoading ? <Spinner /> : null}
        {isError ? (
          <p className="text-center text-sm font-bold text-red-500">
            Error al obtener la dirección
          </p>
        ) : null}
        {data && !data.data.length && !transaction.address.includes("@") ? (
          <p className="text-center text-sm font-bold text-red-500">
            No se encontró ningún usuario con esta dirección, si confirmas la
            transacción se podria enviar a alguien que no deseas.
          </p>
        ) : null}
        {data && !data.data.length && transaction.address.includes("@") ? (
          <p className="text-center text-sm font-bold text-red-500">
            No se encontró ningún usuario con este correo electrónico.
          </p>
        ) : null}
        {data && data.data.length ? (
          <div className="flex flex-col items-center">
            <p className="text-center font-bold">
              Enviar a {data.data[0].name}
            </p>
            <Avatar className="h-14 w-14 my-4">
              <AvatarImage
                src={data.data[0].image || ""}
                alt={data.data[0].name}
              />
              <AvatarFallback className="rounded-lg">
                {data.data[0].name[0]}
              </AvatarFallback>
            </Avatar>
            <p className="text-center text-sm font-bold">{data.data[0].name}</p>
            <p className="text-center text-sm text-muted-foreground">
              {data.data[0].email}
            </p>
            <p className="text-center text-sm text-muted-foreground max-w-40 text-ellipsis overflow-hidden">
              {data.data[0].wallet}
            </p>
          </div>
        ) : null}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-8"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancelar
            </Button>
            <Button
              disabled={
                isLoading ||
                isError ||
                !data ||
                (data && !data.data.length && transaction.address.includes("@"))
              }
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
