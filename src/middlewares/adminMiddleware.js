/**
 * Middleware para restringir acesso apenas a administradores
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso negado. Recurso exclusivo para administradores.' });
  }
  return next();
}

module.exports = adminMiddleware;
