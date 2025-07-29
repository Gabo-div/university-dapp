import { ClipboardIcon, QrCodeIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  address: string;
  email: string;
}

export default function ReceiveDialog({ address, email }: Props) {
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Dirección copiada al portapapeles");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <QrCodeIcon />
          Recibir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Recibir</DialogTitle>
          <DialogDescription>
            Comparte tu dirección de billetera o correo para recibir tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <QRCode value={address} className="bg-white p-8 rounded-3xl" />
        </div>

        <div className="flex gap-4 items-end">
          <Label className="grid w-full">
            <span>Dirección de billetera</span>
            <Input readOnly value={address} />
          </Label>
          <Button
            size="icon"
            onClick={() => handleCopy(address)}
            aria-label="Copy Address"
          >
            <ClipboardIcon />
          </Button>
        </div>

        <div className="flex gap-4 items-end">
          <Label className="grid w-full">
            <span>Dirección de correo</span>
            <Input readOnly value={email} />
          </Label>
          <Button
            size="icon"
            onClick={() => handleCopy(email)}
            aria-label="Copy Email"
          >
            <ClipboardIcon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
