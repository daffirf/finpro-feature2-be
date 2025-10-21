import { Request, Response, NextFunction } from "express";
import { ApiError, UnauthorizedError, ForbiddenError } from "@/utils/api-error";
import { UserRole } from "@/generated/prisma";

// Interface untuk User dari JWT payload
interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  isEmailVerified?: boolean;
}

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export class RBACMiddleware {
  /**
   * Check if user has required roles
   * Usage: rbac.checkRole(['tenant']) or rbac.checkRole(['user', 'tenant'])
   */
  public checkRole(requiredRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (!user) {
          throw new UnauthorizedError("Authentication required. Please login first.");
        }

        if (!user.role || !requiredRoles.includes(user.role)) {
          throw new ForbiddenError(
            `Access denied. Required role: ${requiredRoles.join(" or ")}`
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Require user to be logged in
   * Usage: rbac.requireLogin
   */
  public requireLogin = (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedError("You must login first");
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Require user email to be verified
   * Usage: rbac.requireVerified
   */
  public requireVerified = (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedError("You must login first");
      }

      // Jika isEmailVerified tidak ada di JWT, anggap false
      if (user.isEmailVerified === false) {
        throw new ForbiddenError(
          "Email verification required. Please verify your email address."
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Require specific roles AND email verification
   * Usage: rbac.requireRoles(['tenant'])
   */
  public requireRoles(requiredRoles: UserRole[], requireVerification: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        // Check login
        if (!user) {
          throw new UnauthorizedError("Authentication required. Please login first.");
        }

        // Check role
        if (!user.role || !requiredRoles.includes(user.role)) {
          throw new ForbiddenError(
            `Access denied. This feature is only available for ${requiredRoles.join(" or ")}.`
          );
        }

        // Check email verification (optional)
        if (requireVerification && user.isEmailVerified === false) {
          throw new ForbiddenError(
            "Email verification required. Please verify your email to access this feature."
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Only verified TENANT can access
   * Usage: rbac.onlyTenant
   */
  public onlyTenant = (req: Request, res: Response, next: NextFunction) => {
    return this.requireRoles(['tenant'], true)(req, res, next);
  };

  /**
   * Only verified USER can access
   * Usage: rbac.onlyUser
   */
  public onlyUser = (req: Request, res: Response, next: NextFunction) => {
    return this.requireRoles(['user'], true)(req, res, next);
  };

  /**
   * Both user and tenant can access (but must be verified)
   * Usage: rbac.anyVerifiedRole
   */
  public anyVerifiedRole = (req: Request, res: Response, next: NextFunction) => {
    return this.requireRoles(['user', 'tenant'], true)(req, res, next);
  };

  /**
   * Prevent cross-role access
   * Tenant cannot access user features and vice versa
   * Usage: rbac.preventCrossRole(['user'])
   */
  public preventCrossRole(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (!user) {
          throw new UnauthorizedError("Authentication required");
        }

        if (!allowedRoles.includes(user.role)) {
          const roleType = user.role === 'tenant' ? 'tenant' : 'user';
          throw new ForbiddenError(
            `This feature is not available for ${roleType} accounts. Please use the appropriate ${roleType} features.`
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user owns the resource
   * Usage: rbac.checkOwnership('userId') or rbac.checkOwnership('tenantId')
   */
  public checkOwnership(paramKey: string = 'id') {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;
        const resourceOwnerId = parseInt(req.params[paramKey]);

        if (!user) {
          throw new UnauthorizedError("Authentication required");
        }

        if (user.id !== resourceOwnerId) {
          throw new ForbiddenError("You can only access your own resources");
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// Export singleton instance
export const rbac = new RBACMiddleware();

