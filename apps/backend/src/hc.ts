import { app } from "./app";
import { hc as _hc } from "hono/client";

const client = _hc<typeof app>("");
export type Client = typeof client;

export const hc = (...args: Parameters<typeof _hc>): Client =>
  _hc<typeof app>(...args);
