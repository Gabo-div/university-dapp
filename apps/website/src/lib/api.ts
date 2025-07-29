import { hc } from "@repo/backend/hc";

export const client = hc("http://localhost:3000", {
  init: {
    credentials: "include",
  },
});
