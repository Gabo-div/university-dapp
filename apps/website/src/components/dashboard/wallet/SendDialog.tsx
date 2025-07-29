import { SendHorizonalIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseEther } from "viem";
import { useEffect, useState } from "react";
import ConfirmTransaction from "./ConfirmTransaction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface Props {
  balance: string;
}

const formSchema = z.object({
  address: z.string().refine(
    (val) => {
      const { success: isValidEmail } = z.email().safeParse(val);
      const isValidAddress = val.startsWith("0x") && val.length === 42;
      return isValidEmail || isValidAddress;
    },
    {
      message: "Introduce una dirección billetera o correo válida",
    },
  ),
  amount: z.string().refine(
    (val) => {
      try {
        if (!val) return false;

        const ether = parseEther(val);

        if (ether <= 0) {
          return false;
        }

        return true;

        // eslint-disable-next-line
      } catch (error) {
        return false;
      }
    },
    { message: "Introduce una cantidad válida" },
  ),
});

export default function SendDialog({ balance }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"form" | "confirm">("form");
  const [transaction, setTransaction] = useState<{
    address: string;
    amount: string;
    total: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      amount: "",
    },
  });

  useEffect(() => {
    form.reset();
    setTab("form");
    setTransaction(null);
  }, [open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const balanceInWei = BigInt(balance);

    const amountInWei = parseEther(values.amount);

    if (amountInWei >= balanceInWei) {
      form.setError("amount", {
        type: "manual",
        message: "No tienes suficiente saldo",
      });
      return;
    }

    setTransaction({
      address: values.address,
      amount: amountInWei.toString(),
      total: amountInWei.toString(),
    });

    setTab("confirm");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <SendHorizonalIcon />
          Enviar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tab === "form" ? "Enviar" : "Confirmar Envío"}
          </DialogTitle>
          <DialogDescription>
            {tab === "form"
              ? "Envía ETH a una dirección de cartera o correo electrónico."
              : "Confirma el envío de ETH a la dirección seleccionada."}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab}>
          <TabsContent value="form">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-8"
                autoComplete="off"
              >
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Introduce una dirección de cartera o correo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Introduce una cantidad de ETH"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button>Enviar</Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="confirm">
            {transaction ? (
              <ConfirmTransaction
                transaction={transaction}
                onCancel={() => {
                  setTab("form");
                  setTransaction(null);
                }}
                onSuccess={() => {
                  setOpen(false);
                }}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
