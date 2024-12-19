import * as Application from "expo-application";
import {
  createTRPCProxyClient,
  httpBatchLink,
  TRPCClientError,
} from "@trpc/client";
import { differenceInSeconds } from "date-fns";
import { AppRouter } from "@/trpc";
import { router } from "expo-router";
import superjson from "superjson";
import { jwtDecode } from "./jwt.client";
import {
  authSessionAtom,
  logout,
  Session,
  setAuthSessionAtomAndCommitToStorage,
  store,
} from "./store";

export const apis: any = {
  "app.dm0nk.dev": "http://localhost:8081",
  "app.dm0nk.uat": "http://uat.dm0nk.app",
  "app.dm0nk": "https://dm0nk.app",
};

export const BASE_URL =
  apis[Application.applicationId as string] || "http://localhost:8081";

let refreshInProgress = false;

const getTimeDifference = (date: Date) => differenceInSeconds(date, new Date());

function isTokenExpired(token: string) {
  const decoded = jwtDecode(token);
  const date = new Date(decoded.exp! * 1000);
  return getTimeDifference(date) < 0;
}

function getSession(): Session | null {
  const session = store.get(authSessionAtom);
  return !session || session === "unset" ? null : session;
}

const refreshAndGetNewAccessToken = async (): Promise<string> => {
  return new Promise((resolve) => {
    if (refreshInProgress) {
      const session = getSession();
      let subscribe = false;
      if (session) {
        try {
          if (!isTokenExpired(session.accessToken)) {
            resolve(session.accessToken);
          } else {
            subscribe = true;
          }
        } catch (err) {
          console.log("error", err);
        }
      }
      if (subscribe) {
        const unsub = store.sub(authSessionAtom, () => {
          const session2 = getSession();
          if (session2) {
            if (!isTokenExpired(session2.accessToken)) {
              resolve(session2.accessToken);
              unsub();
            }
          } else if (!session2) {
            resolve("");
            unsub();
          }
        });
      }
    } else {
      refreshInProgress = true;
      try {
        const temp = createTRPCProxyClient<AppRouter>({
          links: [
            httpBatchLink({
              url: `${BASE_URL}/api/v1/trpc`,
            }),
          ],
          transformer: superjson,
        });
        temp.auth.refreshToken
          .mutate({
            refreshToken: getSession()?.refreshToken!,
          })
          .then((session) => {
            setAuthSessionAtomAndCommitToStorage(session);
            resolve(session.accessToken);
            refreshInProgress = false;
          })
          .catch((error) => {
            if (error instanceof TRPCClientError) {
              console.error("TRPC Client Error:", error.message);
              console.error("Error data:", error.data);
              console.error("Error Cause:", error.cause);
              if (
                error.data.code === "UNAUTHORIZED" ||
                error.data.code === "BAD_REQUEST"
              ) {
                logout();
                router.replace("/sign-in");
              }
            } else {
              console.error("Unexpected error:", error);
            }
            refreshInProgress = false;
          });
      } catch (err) {
        console.log(err);
      }
    }
  });
};

export const getBearerToken: () => Promise<string | null> = async () => {
  const session = getSession();
  if (!session || session.accessToken) {
    return null;
  }
  if (isTokenExpired(session.accessToken)) {
    const newToken = await refreshAndGetNewAccessToken();
    return newToken;
  } else {
    return session.accessToken;
  }
};

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${BASE_URL}/api/v1/trpc`,
      headers: async (opts) => {
        const token = await getBearerToken();
        return {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      },
    }),
  ],
  transformer: superjson,
});
