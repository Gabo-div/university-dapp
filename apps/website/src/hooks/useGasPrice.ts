import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

export default function useGasPrice() {
  return useQuery({
    queryKey: ["price", "gas"],
    queryFn: async () => {
      const res = await client.api.prices.gas.$get();
      return await res.json();
    },
    initialData: { data: { price: "0" } },
  });
}
