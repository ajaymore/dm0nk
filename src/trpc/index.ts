import { router } from "./core";
import { authRouter } from "./routers/auth";
// import { groceriesRouter } from "./routers/groceries";
// import { notifyRouter } from "./routers/notify";
export { createContext } from "./core";

export const appRouter = router({
  auth: authRouter,
  //   notify: notifyRouter,
  //   groceries: groceriesRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
