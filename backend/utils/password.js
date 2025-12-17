import crypto from "crypto";

const DEFAULT_PASSWORD_LENGTH = 12;
const PASSWORD_CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}";

export const generateTemporaryPassword = (length = DEFAULT_PASSWORD_LENGTH) => {
  const chars = PASSWORD_CHARSET;
  const bytes = crypto.randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i += 1) {
    password += chars[bytes[i] % chars.length];
  }

  return password;
};
