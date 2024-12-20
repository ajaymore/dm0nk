import { authedProcedure, publicProcedure, router } from "../core";
import { isBefore } from "date-fns";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getTokens } from "@/lib/jwt.server";
import { db } from "@/lib/db.server";
import { password, refresh_token, user } from "@/lib/schema.server";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "@/lib/crypto.server";

export const authRouter = router({
  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [tokenInstance] = await db
        .select()
        .from(refresh_token)
        .where(eq(refresh_token.token, input.refreshToken))
        .limit(1);
      if (!tokenInstance || !isBefore(new Date(), tokenInstance.expiry)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
          cause: "Token expired",
        });
      }
      const { accessToken, refreshToken } = await getTokens(
        tokenInstance.userId
      );
      await db
        .delete(refresh_token)
        .where(eq(refresh_token.token, input.refreshToken));
      const [userRow] = await db
        .select({
          email: user.email,
          id: user.id,
          name: user.displayName,
        })
        .from(user)
        .where(eq(user.id, tokenInstance.userId));
      return { accessToken, refreshToken, user: userRow };
    }),
  signInEmailPswd: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [userRow] = await db
        .select({
          email: user.email,
          hash: password.hash,
          id: user.id,
          name: user.displayName,
        })
        .from(user)
        .innerJoin(password, eq(user.id, password.userId))
        .where(eq(user.email, input.email))
        .limit(1);

      console.log(user, "user", input);

      if (!userRow || !userRow.hash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const isValidPassword = comparePassword(input.password, userRow.hash);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const { accessToken, refreshToken } = await getTokens(userRow.id);
      return {
        accessToken,
        refreshToken,
        user: { email: userRow.email, id: userRow.id, name: userRow.name },
      };
    }),
  signInGoogle: publicProcedure
    .input(z.object({ idToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { hello: [12, 12] };
      //   const validation = await fetch(
      //     `https://oauth2.googleapis.com/tokeninfo?id_token=${input.idToken}`
      //   ).then((res) => res.json());
      //   if (!validation || !validation.email) {
      //     throw new TRPCError({
      //       code: "UNAUTHORIZED",
      //       message: "Invalid token",
      //     });
      //   }
      //   let user = await db
      //     .selectFrom("unq_user")
      //     .select(["id", "email"])
      //     .where("email", "==", validation.email)
      //     .executeTakeFirst();

      //   if (!user) {
      //     user = await db
      //       .insertInto("unq_user")
      //       .values({
      //         id: ulid(),
      //         email: validation.email,
      //         display_name: validation.name || "",
      //         updated_at: new Date(),
      //         created_at: new Date(),
      //       })
      //       .returning(["id", "email"])
      //       .executeTakeFirst();
      //   }

      //   const { accessToken, refreshToken } = await getTokens(user!.id);
      //   return { accessToken, refreshToken };
    }),
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hash = hashPassword(input.password);
      try {
        const [row] = await db
          .insert(user)
          .values({
            email: input.email,
            displayName: input.name,
          })
          .returning({ id: user.id });
        await db.insert(password).values({
          userId: row.id,
          hash,
        });
        const { accessToken, refreshToken } = await getTokens(row.id);
        return {
          accessToken,
          refreshToken,
          user: { email: input.email, id: row.id, name: input.name },
        };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User probably exists",
        });
      }
    }),
  signOut: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ ctx, input: { refreshToken } }) => {
      if (refreshToken) {
        await db
          .delete(refresh_token)
          .where(eq(refresh_token.token, refreshToken));
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid refresh token",
        });
      }
    }),
  me: authedProcedure.query(async ({ ctx }) => {
    const [row] = await db
      .select({ name: user.displayName, email: user.email })
      .from(user)
      .where(eq(user.id, ctx.user?.id!));
    return row;
  }),
});
