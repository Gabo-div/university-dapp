import { createHono } from "@/lib/hono";
import { university } from "@/lib/contracts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { walletRequiredMiddleware } from "@/middlewares/walletRequired";
import { mnemonicToAccount } from "viem/accounts";
import type { ContractFunctionExecutionError } from "viem";

const app = createHono()
  .post(
    "/",
    walletRequiredMiddleware(),
    zValidator(
      "json",
      z.object({
        name: z.string(),
      }),
    ),
    async (c) => {
      const { name } = c.req.valid("json");
      const phrase = c.get("phrase");

      const account = mnemonicToAccount(phrase);

      try {
        await university.write.addCampus([name], {
          account,
        });
      } catch (e) {
        if ((e as { name: string }).name !== "ContractFunctionExecutionError") {
          throw e;
        }

        const error = e as ContractFunctionExecutionError;

        return c.json(
          {
            error: error.cause.shortMessage,
          },
          400,
        );
      }

      return c.json(
        {
          message: "Campus created",
        },
        201,
      );
    },
  )
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

      const nextId = await university.read.nextCampusId();
      const lastId = nextId - 1n;
      const campusesToFetch =
        cursor + limit > lastId ? lastId - cursor + 1n : cursor + limit;

      const rawCampuses = await Promise.all(
        Array.from({
          length: Number(campusesToFetch),
        }).map((_, i) => university.read.campuses([cursor + BigInt(i)])),
      );

      const campuses = rawCampuses
        .filter((c) => !!c[0])
        .map((c) => ({
          id: c[0],
          name: c[1],
        }));

      let next = null;

      if (campuses.length > limit) {
        next = campuses[campuses.length - 1].id;
        campuses.pop();
      }

      return c.json({ campuses, next });
    },
  )
  .get("/:id", async (c) => {
    const params = c.req.param();

    const [id, name] = await university.read.campuses([BigInt(params.id)]);

    if (!id) {
      return c.json(
        {
          error: "Not Found",
        },
        404,
      );
    }

    return c.json({ data: { id, name } });
  })
  .get(
    "/:id/careers",
    zValidator(
      "query",
      z.object({
        cursor: z.coerce.bigint().optional(),
        limit: z.coerce.bigint().optional(),
      }),
    ),
    async (c) => {
      const params = c.req.param();

      const [[id], careersCount] = await Promise.all([
        university.read.campuses([BigInt(params.id)]),
        university.read.campusCareersCount([BigInt(params.id)]),
      ]);

      if (!id) {
        return c.json(
          {
            error: "Not Found",
          },
          404,
        );
      }

      const careersId = await Promise.all(
        Array.from({ length: Number(careersCount) }, (_, i) =>
          university.read.campusCareers([id, BigInt(i)]),
        ),
      );

      const rawSubjects = await Promise.all(
        careersId.map((subjectId) => university.read.careers([subjectId])),
      );

      const careers = rawSubjects.map((career) => ({
        id: career[0],
        name: career[1],
        campusId: career[2],
      }));

      return c.json({ careers });
    },
  );

export default app;
