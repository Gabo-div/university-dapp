import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

interface Props {
  wallet: string;
}

export default function useWalletTransactions({ wallet }: Props) {
  return useQuery({
    queryKey: ["transactions", { wallet }],
    queryFn: async () => {
      const res = await client.api.transactions.$get({
        query: {
          wallet,
        },
      });

      return await res.json();
    },
    initialData: { data: [] },
  });
}
