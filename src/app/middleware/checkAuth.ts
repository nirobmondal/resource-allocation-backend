import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { Role } from "../../generated/prisma/enums";

export const checkAuth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: "You are not authorized!",
      });
      return;
    }

    // Check if user is banned
    if (session.user.isBanned) {
      res.status(403).json({
        success: false,
        message:
          "Your account has been banned. Contact support for assistance.",
      });
      return;
    }

    req.user = {
      userId: session.user.id,
      role: session.user.role as Role,
      name: session.user.name,
      email: session.user.email,
    };

    if (roles.length && !roles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message:
          "Forbidden! You don't have permission to access this resource!",
      });
      return;
    }

    next();
  };
};
