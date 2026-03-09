import bcrypt from 'bcryptjs';

const SaltRounds = 5;

// 加密密码
export async function encryptPassword(plainPassword: string): Promise<string> {

  const hashedPassword = await bcrypt.hash(plainPassword, SaltRounds);
  return hashedPassword;
}

// 验证密码
export async function comparePassword(enteredPassword: string, hashedPassword: string): Promise<boolean> {

  const result = await bcrypt.compare(enteredPassword, hashedPassword);
  return result;
}
