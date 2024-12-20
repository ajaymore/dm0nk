import { atom, getDefaultStore } from "jotai";
import { MMKV } from "react-native-mmkv";
import { v4 as uuidV4 } from "uuid";

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
  const $globalThis = globalThis as any;
  delete $globalThis.dbInstance;
  storage.delete("session");
  store.set(authSessionAtom, null);
}

export function getDBName() {
  const session = store.get(authSessionAtom) as Session;
  const key = `DB_NAME_${session.user.id}`;
  let dbName = storage.getString(key);
  if (!dbName) {
    dbName = uuidV4();
    storage.set(key, dbName);
  }
  return dbName;
}

export function generateDBName(userId: string) {
  const key = `DB_NAME_${userId}`;
  let dbName = storage.getString(key);
  if (!dbName) {
    dbName = uuidV4();
    storage.set(key, dbName);
  }
  return dbName;
}
