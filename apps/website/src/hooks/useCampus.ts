import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  campusId?: string;
};

export default function useCampus({ campusId }: Props) {
  return useQuery({
    queryKey: ["campuses", campusId],
    queryFn: async () => {
      if (!campusId) {
        throw Error("CampusId is required");
      }

      const res = await client.api.campuses[":id"].$get({
        param: {
          id: campusId,
        },
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.data;
    },
    enabled: !!campusId,
  });
}
