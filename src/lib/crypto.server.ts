import bcrypt from "bcryptjs";

export function hashPassword(pswd: string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(pswd, salt);
  return hash;
}

export function comparePassword(pswd: string, hash: string) {
  return bcrypt.compareSync(pswd, hash);
}
