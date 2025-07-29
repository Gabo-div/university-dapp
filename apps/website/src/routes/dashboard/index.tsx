import { Link, createFileRoute } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWallets from "@/hooks/useWallets";
import useUSDPrice from "@/hooks/useUSDPrice";
import { ethToUsd } from "@/lib/converters";
import ReceiveDialog from "@/components/dashboard/wallet/ReceiveDialog";
import SendDialog from "@/components/dashboard/wallet/SendDialog";
import useUserRoles from "@/hooks/useUserRoles";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth: { session } } = Route.useRouteContext();
  const user = session.data!.user;

  const { data: priceData } = useUSDPrice();
  const { data: walletsData } = useWallets({ userId: user.id });
  const { data: rolesData } = useUserRoles({ userId: user.id });

  const activeWallet = walletsData ? walletsData.find((w) => w.active) : null

  const { data: registeredSubjects } = useQuery({
    queryKey: ["student-subjects"],
    queryFn: async () => {
      if (!session.data) {
        throw Error("User is required");
      }

      const res = await client.api.student[":id"]["subjects"].$get(
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
    },
    enabled: !!session.data && rolesData && rolesData.includes("Estudiante")
  })

  return (
    <div className="flex flex-col space-y-4">
      <section className="rounded-lg flex items-center gap-4 py-8">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.image || ""} alt={user.name} />
          <AvatarFallback className="rounded-lg">{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-xl font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {rolesData && !rolesData.length ? (
            <Badge variant="destructive">
              Verificación Pendiente
            </Badge>
          ) : null}
          {rolesData ? rolesData.map((r) => <Badge key={r}>
            {r}
          </Badge>) : null}
        </div>
        <Button className="ml-auto" size="icon" variant="ghost">
          <SettingsIcon />
        </Button>
      </section>

      <section className="bg-card text-card-foreground rounded-lg p-8 border">
        {activeWallet ? (
          <>
            <div className="flex items-center mb-3">
              <p className="font-bold">Balance</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold">
                {formatEther(BigInt(activeWallet.balance))}
              </p>
              <p className="font-bold text-sm">ETH</p>
            </div>
            <p className="text-muted-foreground text-sm">
              ≈ ${ethToUsd(priceData.data.price, activeWallet.balance)} USD
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <SendDialog balance={activeWallet.balance} />
              <ReceiveDialog
                address={activeWallet.address}
                email={user.email}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 flex-col">
              <p className="font-bold text-xl">No tienes una wallet activa</p>
              <Button asChild>
                <Link to="/dashboard/wallet">Crear Wallet</Link>
              </Button>
            </div>
          </>
        )}
      </section>

      {registeredSubjects && rolesData && rolesData.includes("Estudiante") ? (
        <section className="bg-card text-card-foreground rounded-lg p-8 border">
          <div className="flex items-center mb-3">
            <p className="font-bold">Asignaturas Inscritas</p>
          </div>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader className="bg-muted text-muted-foreground">
                <TableRow>
                  <TableHead className="text-center font-bold">Código</TableHead>
                  <TableHead className="font-bold">Asignatura</TableHead>
                  <TableHead className="text-center font-bold">Semestre</TableHead>
                  <TableHead className="text-center font-bold">UC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registeredSubjects.length ? registeredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="text-center">{subject.id}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell className="text-center">{subject.semester}</TableCell>
                    <TableCell className="text-center">{subject.credits}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No hay asignaturas inscritas.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}

    </div>

  );
}
