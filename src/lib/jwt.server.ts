import { SignJWT, JWK, importPKCS8, jwtVerify, importSPKI } from "jose";
import fs from "fs";
import crypto from "crypto";
import { addDays } from "date-fns";
const pkcs8 = fs.readFileSync("keys/private_key.pem", "utf8");
const pemPublicKey = fs.readFileSync("keys/public_key.pem", "utf8");

export const generateRefreshToken = (): string => {
  const newRefreshToken = crypto.randomBytes(32).toString("hex");
  return newRefreshToken;
};

const alg = "RS256";
const expiry = "1m"; // 1h

export const generateToken = async (
  id: string,
  role: string,
  allowedRoles: string[]
): Promise<string> => {
  const privateKey = await importPKCS8(pkcs8, alg);
  const payload = {
    id: id,
    verified: true,
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": allowedRoles,
      "x-hasura-default-role": role,
      "x-hasura-user-id": id,
      "x-hasura-org-id": "Law.St",
      "x-hasura-custom": "custom-value",
    },
  };
  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(privateKey);

  return accessToken;
};

export const verifyToken = async <T>(token: string): Promise<T | null> => {
  try {
    const publicKey = await importSPKI(pemPublicKey, alg);
    const { payload, protectedHeader } = await jwtVerify(token, publicKey, {
      algorithms: [alg],
    });
    return payload as T;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

export const getTokens = async (id: string) => {
  const accessToken = await generateToken(id, "student", ["student"]);
  const refreshToken = generateRefreshToken();
  //   await db
  //     .insertInto("unq_refresh_token")
  //     .values({
  //       id: ulid(),
  //       token: refreshToken,
  //       expiry: addDays(new Date(), 30),
  //       user_id: id,
  //     })
  //     .execute();
  return { accessToken, refreshToken };
};
