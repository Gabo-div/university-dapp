import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  careerId: string;
};

export default function useCareerPensums({ careerId }: Props) {
  return useQuery({
    queryKey: ["pensums", { careerId }],
    queryFn: async () => {
      const res = await client.api.careers[":id"].pensums.$get({
        param: {
          id: careerId,
        },
        query: {},
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.pensums;
    },
  });
}
