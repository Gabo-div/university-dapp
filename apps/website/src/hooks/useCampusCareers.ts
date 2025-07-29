import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  campusId?: string;
};

export default function useCampusCareers({ campusId }: Props) {
  return useQuery({
    queryKey: ["careers", { campusId }],
    queryFn: async () => {
      if (!campusId) {
        throw Error("CampusId is required");
      }

      const res = await client.api.campuses[":id"].careers.$get({
        param: {
          id: campusId,
        },
        query: {},
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.careers;
    },
    enabled: !!campusId,
  });
}
