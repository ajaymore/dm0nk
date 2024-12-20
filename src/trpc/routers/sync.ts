import { authedProcedure, publicProcedure, router } from "../core";
import { isBefore } from "date-fns";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getTokens } from "@/lib/jwt.server";
import { db } from "@/lib/db.server";
import {
  changeset001,
  myDatabase,
  password,
  refresh_token,
  user,
} from "@/lib/schema.server";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "@/lib/crypto.server";

export const syncRouter = router({
  addDBName: authedProcedure
    .input(z.string().min(1))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;

      const [record] = await db
        .select()
        .from(myDatabase)
        .where(eq(myDatabase.userId, userId))
        .limit(1);

      if (!record) {
        await db.insert(myDatabase).values({
          userId,
          dbIds: [input],
        });
        return { status: "added", dbIds: [input] };
      }

      const currentDbIds = record.dbIds as string[];

      if (!currentDbIds.includes(input)) {
        const updatedDbIds = [...currentDbIds, input];

        await db
          .update(myDatabase)
          .set({ dbIds: updatedDbIds })
          .where(eq(myDatabase.userId, userId));

        return { status: "added", dbIds: updatedDbIds };
      }

      return { status: "no-op", dbIds: currentDbIds };
    }),
  addChangeSet: authedProcedure
    .input(
      z.object({
        dbId: z.string().min(1),
        userId: z.string().min(1),
        changeset: z.string().min(1),
        timestamp: z.number(),
        resourceId: z.string().min(1),
        createdById: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;

      //   await db.insert(changeset001).values(input);

      return { status: "added" };
    }),
});
