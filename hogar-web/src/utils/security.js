const SENSITIVE_KEYS = new Set([
  'contrase_a',
  'contrasena',
  'contraseña',
  'password',
]);

export function redactSensitiveData(value) {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((safeValue, [key, item]) => {
    if (!SENSITIVE_KEYS.has(key.toLowerCase())) {
      safeValue[key] = redactSensitiveData(item);
    }
    return safeValue;
  }, {});
}
