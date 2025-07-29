import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  pensumId: string;
};

export default function usePensum({ pensumId }: Props) {
  return useQuery({
    queryKey: ["pensums", pensumId],
    queryFn: async () => {
      const res = await client.api.pensums[":id"].$get({
        param: {
          id: pensumId,
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
