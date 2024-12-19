import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext, appRouter } from "@/trpc";

export const handler = async (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/v1/trpc",
    req: request,
    router: appRouter,
    createContext,
  });
};

export const { GET, POST } = {
  GET: handler,
  POST: handler,
};
