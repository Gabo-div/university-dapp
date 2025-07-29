import { useEffect, useState } from "react";
import { ClipboardIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { english, generateMnemonic } from "viem/accounts";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/lib/api";

type Step = {
  title: string;
  Component: (props: {
    phrase: string;
    nextStep: () => void;
    prevStep: () => void;
    close: () => void;
  }) => React.ReactNode;
};

const steps: Step[] = [
  {
    title: "Entiende tu Billetera",
    Component: ({ nextStep }) => (
      <div className="flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          Entiende tu Billetera
        </h2>
        <p className="text-muted-foreground">
          Una billetera es una herramienta que te permite almacenar y gestionar
          tus tokens de forma segura. Es esencial entender cómo funciona para
          proteger tus activos digitales.
        </p>

        <section>
          <h3 className="text-lg font-bold">
            ¿Qué es una frase de recuperación?
          </h3>
          <p className="text-muted-foreground">
            La frase de recuperación es una serie de palabras que actúan como
            una contraseña para acceder a tu billetera. Es crucial mantenerla en
            un lugar seguro y nunca compartirla con nadie.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold">
            ¿Como puedo proteger mi frase de recuperación?
          </h3>
          <ul className="list-inside list-disc text-muted-foreground space-y-1">
            <li>Anota la frase en un papel y guárdala en un lugar seguro.</li>
            <li>
              Nunca compartas tu frase con nadie, ni siquiera con amigos o
              familiares.
            </li>
            <li>
              Considera usar un gestor de contraseñas para almacenar tu frase de
              forma segura.
            </li>
          </ul>
        </section>

        <Button onClick={() => nextStep()}>Siguiente</Button>
      </div>
    ),
  },
  {
    title: "Asegura tu Frase",
    Component: ({ phrase, prevStep, nextStep }) => {
      const [showPhrase, setShowPhrase] = useState(false);

      return (
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            Asegura tu Frase de Recuperación
          </h2>
          <p className="text-muted-foreground text-center">
            Guarda tu frase de recuperación en un lugar seguro y nunca la
            compartas. Es la única forma de acceder a tu billetera si pierdes el
            acceso a tu cuenta.
          </p>

          <section>
            <h2 className="text-lg font-bold mb-4">Consejos</h2>
            <ul className="list-inside list-disc text-muted-foreground space-y-1">
              <li>Anota la frase en un papel y guárdala en un lugar seguro.</li>
              <li>
                Nunca compartas tu frase con nadie, ni siquiera con amigos o
                familiares.
              </li>
              <li>
                Considera usar un gestor de contraseñas para almacenar tu frase
                de forma segura.
              </li>
            </ul>
          </section>

          <section className="flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-9 border rounded-xl relative overflow-hidden">
              {phrase.split(" ").map((word, index) => (
                <div className="flex items-center" key={index}>
                  <span className="w-10">{index + 1}.</span>
                  <Input readOnly value={word} />
                </div>
              ))}
              <div
                className={cn(
                  "flex items-center justify-center absolute top-0 left-0 w-full h-full bg-zinc-900/10 backdrop-blur-xl cursor-pointer",
                  showPhrase ? "hidden" : "",
                )}
                onClick={() => setShowPhrase(true)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Asegurate de que nadie este viendo
                  </span>
                  <EyeIcon className="size-4" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 mt-4 gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowPhrase((prev) => !prev)}
              >
                {showPhrase ? (
                  <>
                    Ocultar
                    <EyeOffIcon />
                  </>
                ) : (
                  <>
                    Mostrar
                    <EyeIcon />
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(phrase);
                  toast.success("Frase copiada al portapapeles");
                }}
              >
                Copiar
                <ClipboardIcon />
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-2 mt-4 gap-2">
            <Button variant="outline" onClick={prevStep}>
              Volver
            </Button>
            <Button onClick={nextStep}>Siguiente</Button>
          </div>
        </div>
      );
    },
  },
  {
    title: "Confirma tu Frase",
    Component: ({ phrase, prevStep, close }) => {
      const [hiddenIndexes, setHiddenIndex] = useState<number[]>([]);
      const [words, setWords] = useState<string[]>(
        Array(phrase.split(" ").length).fill(""),
      );

      const [password, setPassword] = useState<string>("");

      useEffect(() => {
        const wordsToHide = 3;
        const wordsArray = phrase.split(" ");
        const randomIndexes = new Set<number>();

        while (randomIndexes.size < wordsToHide) {
          const randomIndex = Math.floor(Math.random() * wordsArray.length);
          randomIndexes.add(randomIndex);
        }

        const newWords = wordsArray.map((word, index) => {
          if (randomIndexes.has(index)) {
            return "";
          }
          return word;
        });

        setHiddenIndex(Array.from(randomIndexes));
        setWords(newWords);
      }, [phrase]);

      const handleConfirm = async () => {
        if (words.join(" ") !== phrase || !password) {
          return;
        }

        const res = await client.api.wallets.$post({
          json: {
            phrase,
            password,
          },
        });

        if (res.status === 400) {
          toast.error("Contraseña incorrecta");
          return;
        }

        if (!res.ok) {
          toast.error("Error al crear la billetera");
          return;
        }

        toast.success("Billetera creada con éxito");
        close();
      };

      return (
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            Confirma tu Frase de Recuperación
          </h2>
          <p className="text-muted-foreground text-center">
            Para asegurarte de que has anotado correctamente tu frase de
            recuperación, llena los espacios en blanco a continuación.
          </p>

          <section className="p-8 border rounded-xl grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 grid">
            {phrase.split(" ").map((_, index) => (
              <div className="flex items-center" key={index}>
                <span className="w-10">{index + 1}.</span>
                <Input
                  readOnly={!hiddenIndexes.includes(index)}
                  value={words[index]}
                  onChange={(e) => {
                    const newWords = [...words];
                    newWords[index] = e.target.value;
                    setWords(newWords);
                  }}
                  className="border-blue-500 read-only:border-border"
                />
              </div>
            ))}
          </section>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 mt-4 gap-2">
            <Button variant="outline" onClick={prevStep}>
              Volver
            </Button>
            <Button
              disabled={words.join(" ") !== phrase || !password}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </div>
      );
    },
  },
];

export default function CreateWalletDialog() {
  const [phrase, setPhrase] = useState("");
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhrase("");
      setCurrentStep(0);
      return;
    }

    const mnemonic = generateMnemonic(english);
    setPhrase(mnemonic);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Crear Billetera</Button>
      <DialogContent className="sm:max-w-2xl px-8">
        <DialogHeader>
          <DialogTitle className="sr-only">Crear Billetera</DialogTitle>
          <DialogDescription className="sr-only">
            Crea una billetera para almacenar tus tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-evenly mb-10">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center w-20">
              <div
                className={cn(
                  "rounded-full size-12 flex items-center justify-center border-2 text-border",
                  index < currentStep
                    ? "border-primary bg-primary text-background"
                    : "",
                  index === currentStep ? "border-primary text-primary" : "",
                )}
              >
                <span className="font-bold text-sm">{index + 1}</span>
              </div>
              <p
                className={cn(
                  "text-center text-sm mt-2 font-bold text-border",
                  index <= currentStep ? "text-primary"
                    : "",
                )}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <Tabs value={currentStep.toString()}>
          {steps.map((step, i) => (
            <TabsContent value={i.toString()} key={i}>
              {
                <step.Component
                  phrase={phrase}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  close={handleClose}
                />
              }
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
