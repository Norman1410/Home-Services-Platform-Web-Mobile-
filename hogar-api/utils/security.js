const crypto = require('crypto');

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};
const HASH_PREFIX = 'scrypt';
const SENSITIVE_KEYS = new Set([
  'contrase_a',
  'contraseña',
  'contrasena',
  'password',
]);
const PUBLIC_USER_SELECT = Object.freeze({
  id: true,
  nombre: true,
  email: true,
  rol: true,
  foto_url: true,
  creado_en: true,
  telefono: true,
});

function derivePasswordKey(password, salt, params = SCRYPT_PARAMS) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, params, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

function validatePasswordInput(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('La contraseña es requerida');
  }
}

function isPasswordHash(value) {
  return typeof value === 'string' && value.startsWith(`${HASH_PREFIX}$`);
}

async function hashPassword(password) {
  validatePasswordInput(password);

  const salt = crypto.randomBytes(16).toString('base64url');
  const derivedKey = await derivePasswordKey(password, salt);

  return [
    HASH_PREFIX,
    SCRYPT_PARAMS.N,
    SCRYPT_PARAMS.r,
    SCRYPT_PARAMS.p,
    salt,
    derivedKey.toString('base64url'),
  ].join('$');
}

async function verifyPassword(password, storedPassword) {
  validatePasswordInput(password);

  if (!isPasswordHash(storedPassword)) {
    return {
      valid: storedPassword === password,
      needsRehash: storedPassword === password,
    };
  }

  const [, n, r, p, salt, expectedHash] = storedPassword.split('$');
  if (!n || !r || !p || !salt || !expectedHash) {
    return { valid: false, needsRehash: false };
  }

  const params = {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT_PARAMS.maxmem,
  };
  if (![params.N, params.r, params.p].every((value) => Number.isInteger(value) && value > 0)) {
    return { valid: false, needsRehash: false };
  }

  const derivedKey = await derivePasswordKey(password, salt, {
    N: params.N,
    r: params.r,
    p: params.p,
    maxmem: params.maxmem,
  });

  const expectedBuffer = Buffer.from(expectedHash, 'base64url');
  if (expectedBuffer.length !== derivedKey.length) {
    return { valid: false, needsRehash: false };
  }

  return {
    valid: crypto.timingSafeEqual(derivedKey, expectedBuffer),
    needsRehash: false,
  };
}

function redactSensitiveData(value) {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (!value || typeof value !== 'object' || value instanceof Date || Buffer.isBuffer(value)) {
    return value;
  }

  return Object.entries(value).reduce((safeValue, [key, item]) => {
    if (!SENSITIVE_KEYS.has(key.toLowerCase())) {
      safeValue[key] = redactSensitiveData(item);
    }
    return safeValue;
  }, {});
}

function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return 'correo-no-valido';

  const [name, domain] = email.split('@');
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

function logSecurityEvent(logger, event, metadata = {}) {
  const safeMetadata = redactSensitiveData(metadata);
  logger.info(`[seguridad] ${event}`, safeMetadata);
}

module.exports = {
  hashPassword,
  isPasswordHash,
  logSecurityEvent,
  maskEmail,
  PUBLIC_USER_SELECT,
  redactSensitiveData,
  verifyPassword,
};
