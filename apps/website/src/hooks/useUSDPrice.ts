import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

export default function useUSDPrice() {
  return useQuery({
    queryKey: ["price", "usd"],
    queryFn: async () => {
      const res = await client.api.prices.usd.$get();
      return await res.json();
    },
    initialData: { data: { price: "0" } },
  });
}
