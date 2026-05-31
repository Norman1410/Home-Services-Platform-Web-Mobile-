const assert = require('node:assert/strict');
const test = require('node:test');
const {
  hashPassword,
  isPasswordHash,
  redactSensitiveData,
  verifyPassword,
} = require('../utils/security');

test('hashPassword guarda un hash verificable y no el texto plano', async () => {
  const plainPassword = 'ClaveSegura123!';
  const storedPassword = await hashPassword(plainPassword);

  assert.notEqual(storedPassword, plainPassword);
  assert.equal(isPasswordHash(storedPassword), true);

  const result = await verifyPassword(plainPassword, storedPassword);
  assert.deepEqual(result, { valid: true, needsRehash: false });
});

test('verifyPassword rechaza una contrasena incorrecta', async () => {
  const storedPassword = await hashPassword('ClaveSegura123!');
  const result = await verifyPassword('ClaveIncorrecta123!', storedPassword);

  assert.deepEqual(result, { valid: false, needsRehash: false });
});

test('verifyPassword detecta credenciales antiguas en texto plano para migrarlas', async () => {
  const result = await verifyPassword('texto-plano-viejo', 'texto-plano-viejo');

  assert.deepEqual(result, { valid: true, needsRehash: true });
});

test('redactSensitiveData elimina contrasenas en respuestas anidadas', () => {
  const usuario = {
    id: 'user-1',
    email: 'persona@example.com',
    contrase_a: 'hash-o-texto-que-no-debe-salir',
    trabajadores: [
      {
        id: 7,
        usuarios: {
          nombre: 'Persona',
          password: 'otro-secreto',
        },
      },
    ],
  };

  assert.deepEqual(redactSensitiveData(usuario), {
    id: 'user-1',
    email: 'persona@example.com',
    trabajadores: [
      {
        id: 7,
        usuarios: {
          nombre: 'Persona',
        },
      },
    ],
  });
});
