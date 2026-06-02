const PUBLIC_ROLES = new Set(['cliente', 'trabajador']);
const PROTECTED_USER_FIELDS = new Set([
  'id',
  'email',
  'correo',
  'rol',
  'role',
  'permisos',
  'permissions',
  'admin',
  'isadmin',
  'is_admin',
  'contrase_a',
  'contraseña',
  'contrasena',
  'password',
  'creado_en',
]);
const SENSITIVE_LOG_FIELDS = new Set([
  'contrase_a',
  'contraseña',
  'contrasena',
  'password',
]);

class AccessControlError extends Error {
  constructor(message, code = 'ACCESS_CONTROL_DENIED', statusCode = 400, details = {}) {
    super(message);
    this.name = 'AccessControlError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function validateRegistrationRole(role) {
  const normalizedRole = normalizeRole(role);

  if (!PUBLIC_ROLES.has(normalizedRole)) {
    throw new AccessControlError('Rol no permitido para registro', 'ROL_NO_PERMITIDO', 400, {
      rol: normalizedRole || '(vacio)',
    });
  }

  return normalizedRole;
}

function findProtectedUserFields(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }

  return Object.keys(payload).filter((field) => PROTECTED_USER_FIELDS.has(field.toLowerCase()));
}

function redactForAudit(value) {
  if (Array.isArray(value)) {
    return value.map(redactForAudit);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((safeValue, [key, item]) => {
    safeValue[key] = SENSITIVE_LOG_FIELDS.has(key) ? '[redactado]' : redactForAudit(item);
    return safeValue;
  }, {});
}

function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return 'correo-no-valido';

  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

function logSecurityEvent(logger, event, metadata = {}, level = 'warn') {
  const fallbackLog = typeof logger.info === 'function' ? logger.info : () => {};
  const log = typeof logger[level] === 'function' ? logger[level] : fallbackLog;
  log.call(logger, `[seguridad] ${event}`, redactForAudit(metadata));
}

module.exports = {
  AccessControlError,
  findProtectedUserFields,
  logSecurityEvent,
  maskEmail,
  normalizeRole,
  validateRegistrationRole,
};
