import { createFileRoute } from "@tanstack/react-router";
import { formatEther } from "viem";
import { EllipsisIcon } from "lucide-react";
import CreateWalletDialog from "@/components/dashboard/wallet/CreateWalletDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useWallets from "@/hooks/useWallets";
import useUSDPrice from "@/hooks/useUSDPrice";
import { ethToUsd } from "@/lib/converters";
import ReceiveDialog from "@/components/dashboard/wallet/ReceiveDialog";
import SendDialog from "@/components/dashboard/wallet/SendDialog";
import WalletTransactions from "@/components/dashboard/wallet/WalletTransactions";

export const Route = createFileRoute("/dashboard/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const user = auth.session.data!.user;

  const { data: walletData } = useWallets({ userId: user.id });
  const { data: priceData } = useUSDPrice();

  const activeWallet = walletData ? walletData.find((w) => w.active) : null;
  const inactiveWallets = walletData ? walletData.filter((w) => !w.active) : [];

  if (!activeWallet && !inactiveWallets.length) {
    return (
      <main className="flex items-center justify-center flex-1">
        <article className="w-full max-w-md space-y-4 flex flex-col rounded-xl p-8">
          <h2 className="text-2xl font-bold">Crear Billetera</h2>
          <p className="text-muted-foreground font-lg">
            Crea una billetera para almacenar tus tokens.
          </p>
          <CreateWalletDialog />
        </article>
      </main>
    );
  }

  return (
    <main className="gap space-y-8">
      <section>
        <h2 className="font-bold text-xl mb-4">Billetera activa</h2>
        {activeWallet ? (
          <article className="bg-card text-card-foreground rounded-lg p-8 border">
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
          </article>
        ) : (
          <article className="bg-card text-card-foreground rounded-lg p-8 flex items-center gap-4 flex-col border">
            <p className="font-bold text-xl">No tienes una wallet activa</p>
            <CreateWalletDialog />
          </article>
        )}
      </section>

      {activeWallet ? (
        <WalletTransactions wallet={activeWallet.address} />
      ) : null}

      {inactiveWallets.length ? (
        <section>
          <h2 className="font-bold text-xl mb-4">Billeteras inactivas</h2>
          <article className="bg-card text-card-foreground rounded-lg p-8 border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>≈ USD</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveWallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell>
                      <div className="overflow-hidden text-ellipsis w-40">
                        {wallet.address}
                      </div>
                    </TableCell>
                    <TableCell>{formatEther(BigInt(wallet.balance))}</TableCell>
                    <TableCell>
                      {ethToUsd(priceData.data.price, wallet.balance)}
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="outline">
                        <EllipsisIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </article>
        </section>
      ) : null}
    </main>
  );
}
