import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../utils/validators/auth.validator";
import { AppError } from "../middlewares/errorHandler";

const buildTokens = (user: { id: string; email: string; role: any }) => ({
  accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
  refreshToken: signRefreshToken({ sub: user.id, email: user.email, role: user.role }),
});

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError(409, "Email already in use");

    const hashed = await hashPassword(input.password);
    const user = await userRepository.create({ email: input.email, password: hashed });

    return { user, ...buildTokens(user) };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await comparePassword(input.password, user.password);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const { password: _, ...safeUser } = user;
    return { user: safeUser, ...buildTokens(safeUser) };
  },

  async refresh(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) throw new AppError(401, "User no longer exists");

    return buildTokens(user);
  },
};