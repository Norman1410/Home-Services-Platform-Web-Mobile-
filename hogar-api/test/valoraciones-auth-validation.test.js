const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { buildValoracionesRouter } = require('../routes/valoraciones');
const { createSessionToken } = require('../lib/security/session');

process.env.SESSION_SECRET = 'test-session-secret';

// ── helper ────────────────────────────────────────────────────────────────────

function createTestServer(fakePrisma) {
  const app = express();
  app.use(express.json());
  app.use('/api/valoraciones', buildValoracionesRouter(fakePrisma));

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

// ── tests ─────────────────────────────────────────────────────────────────────

test('POST /api/valoraciones rechaza petición sin token (401)', async () => {
  let createCalled = false;
  const fakePrisma = {
    valoraciones: {
      create: async () => { createCalled = true; }
    }
  };

  const server = await createTestServer(fakePrisma);
  try {
    const response = await fetch(`${server.url}/api/valoraciones`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        trabajador_id: 1,
        calificacion: 5,
        comentario: 'Test sin token',
        cliente_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      }),
    });

    assert.equal(response.status, 401, 'Sin token debe responder 401');
    assert.equal(createCalled, false, 'Prisma no debe ser llamado sin token');
  } finally {
    await server.close();
  }
});

test('POST /api/valoraciones ignora cliente_id del body y usa el del token', async () => {
  const realUserId    = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const spoofedUserId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  let capturedData;

  const fakePrisma = {
    valoraciones: {
      create: async ({ data }) => {
        capturedData = data;
        return { id: 1, comentario: data.comentario, calificacion: data.calificacion };
      }
    }
  };

  const token = createSessionToken({
    id: realUserId,
    rol: 'cliente',
    email: 'real@example.com'
  });

  const server = await createTestServer(fakePrisma);
  try {
    const response = await fetch(`${server.url}/api/valoraciones`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trabajador_id: 1,
        calificacion: 5,
        comentario: 'Valoracion de prueba',
        cliente_id: spoofedUserId  // ← ID falso en el body
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(
      capturedData.usuarios.connect.id,
      realUserId,
      'cliente_id debe venir del token'
    );
    assert.notEqual(
      capturedData.usuarios.connect.id,
      spoofedUserId,
      'cliente_id del body debe ser ignorado'
    );
  } finally {
    await server.close();
  }
});

test('POST /api/valoraciones con token válido crea la valoración correctamente', async () => {
  const userId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  let capturedClienteId;

  const fakePrisma = {
    valoraciones: {
      create: async ({ data }) => {
        capturedClienteId = data.usuarios.connect.id;
        return { id: 1, cliente_id: capturedClienteId };
      }
    }
  };

  const token = createSessionToken({
    id: userId,
    rol: 'cliente',
    email: 'usuario@example.com'
  });

  const server = await createTestServer(fakePrisma);
  try {
    const response = await fetch(`${server.url}/api/valoraciones`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trabajador_id: 1,
        calificacion: 4,
        comentario: 'Muy buen servicio'
        // sin cliente_id en el body
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(capturedClienteId, userId, 'La valoración debe tener el userId del token');
  } finally {
    await server.close();
  }
});