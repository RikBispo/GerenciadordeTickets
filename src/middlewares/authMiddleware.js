const jwt = require('jsonwebtoken');

/**
 * Middleware para validar o token JWT no cabeçalho Authorization
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET || 'ticketeria_corporativa_secret_key_2026_itsm_secure';
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
