import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  userId?: string;
};

export default function useUserInfo({ userId }: Props) {
  return useQuery({
    queryKey: ["user-info", { userId }],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const res = await client.api.users[":id"].info.$get({
        param: { id: userId },
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.data || null;
    },
    enabled: !!userId,
  });
}
