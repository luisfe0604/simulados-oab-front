import jwt from "jsonwebtoken";
import { env } from "./env";

const TOKEN_TTL = "7d";

export interface SessionPayload {
  userId: number;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof (decoded as Record<string, unknown>).userId === "number"
    ) {
      return { userId: (decoded as { userId: number }).userId };
    }
    return null;
  } catch {
    return null;
  }
}
