import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

interface Props {
  userId: string;
}

export default function useWallets({ userId }: Props) {
  return useQuery({
    queryKey: ["wallets", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const res = await client.api.users[":id"].wallets.$get({
        param: {
          id: userId,
        },
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.data;
    },
  });
}
