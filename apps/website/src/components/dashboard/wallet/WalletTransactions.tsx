import { formatEther } from "viem";
import { format } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon, ClipboardIcon } from "lucide-react";
import { toast } from "sonner";
import useWalletTransactions from "@/hooks/useWalletTransactions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Props {
  wallet: string;
}
export default function WalletTransactions({ wallet }: Props) {
  const { data } = useWalletTransactions({ wallet });

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="font-bold text-xl mb-4">Transaciones</h2>
      <article className="bg-card text-card-foreground rounded-lg p-8 border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Fecha</TableHead>
              <TableHead className="font-bold">Dirección</TableHead>
              <TableHead className="font-bold">Cantidad</TableHead>
              <TableHead className="font-bold">Tarifa</TableHead>
              <TableHead className="font-bold">HASH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((transaction) => (
              <TableRow key={transaction.hash}>
                <TableCell>
                  {format(
                    parseInt(transaction.timeStamp) * 1000,
                    "dd/MM/yyyy'",
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.from === wallet.toLowerCase() ? (
                      <ArrowLeftIcon className="size-4 text-red-500 dark:text-red-400" />
                    ) : (
                      <ArrowRightIcon className="size-4 text-green-500 dark:text-green-400" />
                    )}
                    <Address
                      address={
                        transaction.from === wallet.toLowerCase()
                          ? transaction.to
                          : transaction.from
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>{formatEther(BigInt(transaction.value))}</TableCell>
                <TableCell className="text-xs font-bold text-muted-foreground">
                  {formatEther(
                    BigInt(transaction.gasPrice) * BigInt(transaction.gas),
                  )}
                </TableCell>
                <TableCell>
                  <Address address={transaction.hash} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </article>
    </section>
  );
}

const Address = ({ address }: { address: string }) => {
  const shortAddres = (addres: string) => {
    return `${addres.slice(0, 5)}...${addres.slice(-5)}`;
  };

  const handleCopy = (addres: string) => {
    navigator.clipboard.writeText(addres);
    toast.success("Dirección copiada al portapapeles");
  };

  return (
    <div className="flex items-center">
      <span className="flex-1 mr-1">{shortAddres(address)}</span>
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        onClick={() => handleCopy(address)}
      >
        <ClipboardIcon className="size-3.5" />
      </Button>
    </div>
  );
};
