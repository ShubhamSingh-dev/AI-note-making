import bcrypt from "bcrypt";

// Hashes plaintext password using bcrypt with 12 salt rounds for secure storage
export const encryptPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

// Compares plaintext password against bcrypt hash, returns true if match
export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};
