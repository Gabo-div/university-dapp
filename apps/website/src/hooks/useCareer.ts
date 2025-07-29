import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  careerId: string;
};

export default function useCareer({ careerId }: Props) {
  return useQuery({
    queryKey: ["careers", careerId],
    queryFn: async () => {
      const res = await client.api.careers[":id"].$get({
        param: {
          id: careerId,
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
