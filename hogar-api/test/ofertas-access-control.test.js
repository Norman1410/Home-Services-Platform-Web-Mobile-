const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { buildOfertasRouter } = require('../routes/ofertas');
const { createSessionToken } = require('../lib/security/session');

process.env.SESSION_SECRET = 'test-session-secret';

function createTestServer(fakePrisma) {
  const app = express();
  app.use(express.json());
  app.use('/api/ofertas', buildOfertasRouter(fakePrisma));

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

test('POST /api/ofertas ignores spoofed cliente_id and uses the signed session user', async () => {
  const authenticatedUserId = '11111111-1111-4111-8111-111111111111';
  const spoofedClienteId = '22222222-2222-4222-8222-222222222222';
  let createdData;

  const fakePrisma = {
    ofertas_trabajo: {
      create: async ({ data }) => {
        createdData = data;
        return { id: 1, ...data };
      },
    },
  };

  const token = createSessionToken({
    id: authenticatedUserId,
    rol: 'cliente',
    email: 'cliente@example.com',
  });

  const server = await createTestServer(fakePrisma);
  try {
    const response = await fetch(`${server.url}/api/ofertas`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cliente_id: spoofedClienteId,
        titulo: 'Reparar ducha',
        descripcion: 'La ducha tiene una fuga',
        servicio_requerido: 'Plomeria',
        ubicacion: 'San Jose',
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(createdData.cliente_id, authenticatedUserId);
    assert.notEqual(createdData.cliente_id, spoofedClienteId);
  } finally {
    await server.close();
  }
});

test('POST /api/ofertas rejects unauthenticated requests', async () => {
  let createCalled = false;
  const fakePrisma = {
    ofertas_trabajo: {
      create: async () => {
        createCalled = true;
      },
    },
  };

  const server = await createTestServer(fakePrisma);
  try {
    const response = await fetch(`${server.url}/api/ofertas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cliente_id: '22222222-2222-4222-8222-222222222222',
        titulo: 'Reparar ducha',
      }),
    });

    assert.equal(response.status, 401);
    assert.equal(createCalled, false);
  } finally {
    await server.close();
  }
});
