import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, verifyToken } from "@/lib/auth/jwt";
import { Role } from "@/lib/db/table_user";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Authentication middleware - verifies JWT token
 */
export const withAuth = <T extends unknown[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
) => {
  return async (req: NextRequest, ...args: T) => {
    try {
      const token = req.cookies.get("token")?.value || "";
      const user = verifyToken(token);
      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq, ...args);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error
            ? error.message
            : "Authentication failed",
        },
        { status: 401 },
      );
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const withRoles = <T extends unknown[]>(
  requiredRoles: Role[],
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
) => {
  return withAuth(async (req: AuthenticatedRequest, ...args: T) => {
    const user = req.user!;

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    return handler(req, ...args);
  });
};


/**
 * Admin-only middleware
 */
export const withAdminOnly = <T extends unknown[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
) => {
  return withRoles(["admin"], handler);
};

/**
 * Editor or Admin middleware
 */
export const withEditorOrAdmin = <T extends unknown[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
) => {
  return withRoles(["editor", "admin"], handler);
};

/**
 * Any authenticated user middleware
 */
export const withAnyRole = <T extends unknown[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
) => {
  return withRoles(["viewer", "editor", "admin"], handler);
};

/**
 * Shelly company middleware - allows access only for users with company === 'shelly'
 */
export const withShellyCompany = <T extends unknown[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
) => {
  return withAuth(async (req: AuthenticatedRequest, ...args: T) => {
    const user = req.user!;
    if (user.company.toLowerCase() !== "shelly") {
      return NextResponse.json(
        { error: "Access restricted to Shelly company only" },
        { status: 403 },
      );
    }
    return handler(req, ...args);
  });
};
