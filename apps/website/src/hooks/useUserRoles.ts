import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

type Props = {
  userId?: string;
};

const roles: [
  "Estudiante",
  "Profesor",
  "Coordinador de Pregrado",
  "Coordinador de Postgrado",
  "Coordinador de Carrera",
  "Administrator",
] = [
  "Estudiante",
  "Profesor",
  "Coordinador de Pregrado",
  "Coordinador de Postgrado",
  "Coordinador de Carrera",
  "Administrator",
];

export default function useUserRoles({ userId }: Props) {
  return useQuery({
    queryKey: ["user-roles", { userId }],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const res = await client.api.users[":id"].roles.$get({
        param: { id: userId },
      });

      const data = await res.json();

      if (!res.ok || "error" in data) {
        throw Error(`Response error: ${data}`);
      }

      return data.data.roles.map((r) => roles[r]);
    },
    enabled: !!userId,
  });
}
