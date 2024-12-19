import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyToken } from "@/lib/jwt.server";

async function getUserFromHeader(authHeader: string | null) {
  if (authHeader) {
    const [_, token] = authHeader.split(" ");
    try {
      const payload = await verifyToken<{ id: string }>(token);
      if (payload) {
        return { id: payload.id };
      }
    } catch {}
  }
  return null;
}

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const authHeader = req.headers.get("Authorization");
  const user = await getUserFromHeader(authHeader);
  return {
    req,
    resHeaders,
    user,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({ transformer: superjson });

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;

type MiddlewareFunction = Parameters<typeof t.procedure.use>[0];
const loggerMiddleware: MiddlewareFunction = async function logger({
  path,
  type,
  next,
  ctx,
}) {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  result.ok
    ? console.log("OK request timing:", { path, type, durationMs })
    : console.log("Non-OK request timing", { path, type, durationMs });
  return result;
};

export const publicProcedure = t.procedure.use(loggerMiddleware);
export const authedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return opts.next({
      ctx,
    });
  });
