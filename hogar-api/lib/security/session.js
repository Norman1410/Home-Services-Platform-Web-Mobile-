const crypto = require('crypto');

function base64UrlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'change-this-session-secret-in-production';
}

function getSessionTTL() {
  return parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10); // default 24h
}
function signPayload(encodedPayload) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function createSessionToken(usuario) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = getSessionTTL();
  const payload = {
    sub: usuario.id,
    rol: usuario.rol,
    email: usuario.email,
    iat: now,
    exp: now + ttl,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

function toSafeUser(usuario) {
  if (!usuario) {
    return null;
  }

  const { contrase_a, ...safeUser } = usuario;
  return safeUser;
}

module.exports = {
  createSessionToken,
  verifySessionToken,
  toSafeUser,
};
