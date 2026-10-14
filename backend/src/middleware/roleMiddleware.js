/**
 * Role-Based Access Control (RBAC) Middleware (Phase 5)
 * Enforces that the authenticated user possesses one of the allowed roles.
 *
 * Pre-condition: Must be preceded by `authenticate` middleware from authMiddleware.js.
 *
 * @param {string|string[]} roles - Allowed role or array of allowed roles (e.g., ['Admin'])
 * @returns {Function} Express middleware
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required. No user context found.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions to access this resource.',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
