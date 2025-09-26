import jwt from "jsonwebtoken";
import { config } from "@/lib/config/envs";

export interface JWTPayload {
  id: string;
  email: string;
  company: string;
  role: string; // Role
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token
 */
export const generateToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(
    payload,
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: "refresh" },
    config.JWT_SECRET,
    { expiresIn: "30d" } as jwt.SignOptions,
  );
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      type: string;
      userId: string;
    };
    if (decoded.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};
