const { verifySessionToken } = require('../lib/security/session');

function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization || '';

  if (!authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sesion no valida o ausente' });
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  const session = verifySessionToken(token);

  if (!session?.sub || !session?.rol) {
    return res.status(401).json({ error: 'Sesion no valida' });
  }

  req.auth = {
    userId: session.sub,
    rol: session.rol,
    email: session.email,
  };

  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta accion' });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
