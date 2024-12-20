import { router } from "./core";
import { authRouter } from "./routers/auth";
import { syncRouter } from "./routers/sync";
export { createContext } from "./core";

export const appRouter = router({
  auth: authRouter,
  sync: syncRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
