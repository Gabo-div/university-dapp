import { createHono } from "@/lib/hono";
import { university } from "@/lib/contracts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = createHono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        cursor: z.coerce.bigint().optional(),
        limit: z.coerce.bigint().optional(),
      }),
    ),
    async (c) => {
      const { cursor = 1n, limit = 10n } = c.req.valid("query");

      const nextId = await university.read.nextCareerId();
      const lastId = nextId - 1n;
      const careersToFetch =
        cursor + limit > lastId ? lastId - cursor + 1n : cursor + limit;

      const rawCareers = await Promise.all(
        Array.from({
          length: Number(careersToFetch),
        }).map((_, i) => university.read.careers([cursor + BigInt(i)])),
      );

      const careers = rawCareers
        .filter((c) => !!c[0])
        .map((c) => ({
          id: c[0],
          name: c[1],
          campusId: c[2],
        }));

      let next = null;

      if (careers.length > limit) {
        next = careers[careers.length - 1].id;
        careers.pop();
      }

      return c.json({ careers, next });
    },
  )
  .get("/:id", async (c) => {
    const params = c.req.param();

    const [id, name, campusId] = await university.read.careers([
      BigInt(params.id),
    ]);

    if (!id) {
      return c.json(
        {
          error: "Not Found",
        },
        404,
      );
    }

    return c.json({ data: { id, name, campusId } });
  })
  .get(
    "/:id/pensums",
    zValidator(
      "query",
      z.object({
        cursor: z.coerce.bigint().optional(),
        limit: z.coerce.bigint().optional(),
      }),
    ),
    async (c) => {
      const params = c.req.param();

      const [[id], pensumsCount] = await Promise.all([
        university.read.careers([BigInt(params.id)]),
        university.read.careerPensumsCount([BigInt(params.id)]),
      ]);

      if (!id) {
        return c.json(
          {
            error: "Not Found",
          },
          404,
        );
      }

      const pensumsId = await Promise.all(
        Array.from({ length: Number(pensumsCount) }, (_, i) =>
          university.read.careerPensums([id, BigInt(i)]),
        ),
      );

      const rawPensums = await Promise.all(
        pensumsId.map((pensumId) => university.read.pensums([pensumId])),
      );

      const pensums = rawPensums.map((pensum) => ({
        id: pensum[0],
        careerId: pensum[1],
      }));

      return c.json({ pensums });
    },
  );

export default app;
