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

      const nextId = await university.read.nextPensumId();
      const lastId = nextId - 1n;
      const pensumsToFetch =
        cursor + limit > lastId ? lastId - cursor + 1n : cursor + limit;

      const rawPensums = await Promise.all(
        Array.from({
          length: Number(pensumsToFetch),
        }).map((_, i) => university.read.pensums([cursor + BigInt(i)])),
      );

      const pensums = rawPensums
        .filter((c) => !!c[0])
        .map((c) => ({
          id: c[0],
          careerId: c[1],
        }));

    let next = null

    if(pensums.length > limit){
      next = pensums[pensums.length - 1].id
      pensums.pop()
    }

      return c.json({ pensums, next});
    },
  )
.get("/:id", async (c) => {
  const params = c.req.param();

  const [[id, careerId], subjectsCount] = await Promise.all([
    university.read.pensums([BigInt(params.id)]),
    university.read.pensumSubjectsCount([BigInt(params.id)]),
  ]);

  if (!id) {
    return c.json(
      {
        error: "Not Found",
      },
      404,
    );
  }

  const subjectsId = await Promise.all(
    Array.from({ length: Number(subjectsCount) }, (_, i) =>
      university.read.pensumSubjects([id, BigInt(i)]),
    ),
  );

  const rawSubjects = await Promise.all(
    subjectsId.map((subjectId) => university.read.subjects([subjectId])),
  );

  const subjects = rawSubjects.map((subject) => ({
    id: subject[0],
    credits: subject[1],
    semester: subject[2],
    name: subject[3],
  }));

  return c.json({
    data: { id, careerId, subjects },
  });
});

export default app;
