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

      const nextId = await university.read.nextSubjectId();
      const lastId = nextId - 1n;
      const subjectsToFetch =
        cursor + limit > lastId ? lastId - cursor + 1n : cursor + limit;

      const rawSubjects = await Promise.all(
        Array.from({
          length: Number(subjectsToFetch),
        }).map((_, i) => university.read.subjects([cursor + BigInt(i)])),
      );

      const subjects = rawSubjects
        .filter((c) => !!c[0])
        .map((c) => ({
          id: c[0],
          credits: c[1],
          semester: c[2],
          name: c[3],
        }));

      let next = null;

      if (subjects.length > limit) {
        next = subjects[subjects.length - 1].id;
        subjects.pop();
      }

      return c.json({ subjects, next });
    },
  )
  .get("/:id", async (c) => {
    const params = c.req.param();

    const [id, credits, semester, name] = await university.read.subjects([
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

    return c.json({ data: { id, credits, semester, name } });
  });

export default app;
