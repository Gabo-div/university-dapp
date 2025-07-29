import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

export default function useCampuses() {
  return useInfiniteQuery({
    queryKey: ["campuses"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const res = await client.api.campuses.$get({
        query: {
          limit: "10",
          cursor: pageParam,
        },
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.next || undefined;
    },
  });
}
