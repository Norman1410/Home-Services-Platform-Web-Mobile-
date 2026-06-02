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

function signPayload(encodedPayload) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function createSessionToken(usuario) {
  const payload = {
    sub: usuario.id,
    rol: usuario.rol,
    email: usuario.email,
    iat: Date.now(),
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
    return JSON.parse(base64UrlDecode(encodedPayload));
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
