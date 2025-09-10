import { genSalt, hash } from 'bcrypt';

const SALT_ROUNDS = 10;
export const hashPassword = async (password) => {
  const salt = await genSalt(SALT_ROUNDS);
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
};
