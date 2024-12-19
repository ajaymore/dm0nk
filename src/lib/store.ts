import { atom, getDefaultStore } from "jotai";
import { MMKV } from "react-native-mmkv";

export type Session = {
  user: { email: string; name: string; id: string };
  refreshToken: string;
  accessToken: string;
};

export const authSessionAtom = atom<Session | null | "unset">("unset");

export const storage = new MMKV();

export const store = getDefaultStore();

export function setAuthSessionAtomAndCommitToStorage(session: Session) {
  store.set(authSessionAtom, session);
  storage.set("session", JSON.stringify(session));
}

export function getAuthSessionFromStorageAndUpdateAtom() {
  const sessionStr = storage.getString("session");
  if (sessionStr) {
    store.set(authSessionAtom, JSON.parse(sessionStr));
  } else {
    store.set(authSessionAtom, null);
  }
}

export function logout() {
  storage.delete("session");
  store.set(authSessionAtom, null);
}
