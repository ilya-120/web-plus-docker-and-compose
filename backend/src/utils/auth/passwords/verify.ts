import { compare } from 'bcrypt';

export const verifyPassword = async (password, hash) => {
  return await compare(password, hash);
};
