import { verifyToken } from "../utils/jwtUtils.js";

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches user info to req.user
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Unauthorized: No token provided",
      requiresLogin: true
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized: Invalid token",
      requiresLogin: true
    });
  }
}

/**
 * Optional middleware that doesn't fail if no token, but attaches user if valid token exists
 */
export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    try {
      const user = verifyToken(token);
      req.user = user;
    } catch (error) {
      // Token invalid but continue without it
    }
  }

  next();
}
