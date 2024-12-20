import {
  authSessionAtom,
  getAuthSessionFromStorageAndUpdateAtom,
} from "@/lib/store";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export function useAuth() {
  const session = useAtomValue(authSessionAtom);

  useEffect(() => {
    getAuthSessionFromStorageAndUpdateAtom();
  }, []);

  return session;
}

export function useSession() {
  const session = useAtomValue(authSessionAtom);

  return session;
}
