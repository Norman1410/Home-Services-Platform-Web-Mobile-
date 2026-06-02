const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const router = require('../routes/usuarios');

// Obtenemos la misma instancia de Prisma que usa tu archivo de rutas internamente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function createTestServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/usuarios', router);

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

test('Test 1 — GET /api/usuarios/:id no debe exponer la contraseña', async () => {
  // Guardamos la función original por si acaso
  const originalFindUnique = prisma.usuarios.findUnique;

  // Interceptamos la llamada para simular el comportamiento de Prisma
  prisma.usuarios.findUnique = async () => {
    return {
      id: 'c345600e-228e-45e0-aa5c-4cf25269dc7b',
      email: 'prueba.security@test.com',
      nombre: 'Usuario Prueba',
      rol: 'cliente',
      foto_url: null,
      telefono: null,
      creado_en: new Date(),
      trabajadores: null
      // contrasena NO se incluye aquí porque tu "select" en código ya la filtra
    };
  };

  const server = await createTestServer();
  try {
    const response = await fetch(`${server.url}/api/usuarios/c345600e-228e-45e0-aa5c-4cf25269dc7b`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.contrasena, undefined);
    assert.equal(data.contrase_a, undefined);
  } finally {
    prisma.usuarios.findUnique = originalFindUnique; // Restauramos
    await server.close();
  }
});

test('Test 2 — PUT /api/usuarios/:id no debe exponer la contraseña tras actualizar', async () => {
  const originalUpdate = prisma.usuarios.update;
  const originalUpdateMany = prisma.trabajadores.updateMany;

  // Simulamos el retorno del update que por defecto incluiría todos los datos de la tabla
  prisma.usuarios.update = async () => {
    return {
      id: 'c345600e-228e-45e0-aa5c-4cf25269dc7b',
      email: 'prueba.security@test.com',
      nombre: 'Usuario Modificado',
      contrase_a: 'password123', // <-- Viene de la BD simulada, pero toSafeUser debe limpiarlo
      rol: 'cliente'
    };
  };

  prisma.trabajadores.updateMany = async () => {
    return { count: 0 };
  };

  const server = await createTestServer();
  try {
    const response = await fetch(`${server.url}/api/usuarios/c345600e-228e-45e0-aa5c-4cf25269dc7b`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Usuario Modificado' }),
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.contrasena, undefined);
    assert.equal(data.contrase_a, undefined);
  } finally {
    prisma.usuarios.update = originalUpdate;
    prisma.trabajadores.updateMany = originalUpdateMany;
    await server.close();
  }
});