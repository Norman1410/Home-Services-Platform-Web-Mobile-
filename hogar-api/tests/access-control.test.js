const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');
const { createAuthRouter } = require('../routes/auth');
const { createUsuariosRouter } = require('../routes/usuarios');

function createLogger() {
  const entries = [];
  return {
    entries,
    info: (...args) => entries.push({ level: 'info', args }),
    warn: (...args) => entries.push({ level: 'warn', args }),
    error: (...args) => entries.push({ level: 'error', args }),
  };
}

function createAuthPrismaMock() {
  const calls = {
    createdUser: null,
    createdWorker: null,
    findUniqueCount: 0,
  };

  return {
    calls,
    prisma: {
      usuarios: {
        findUnique: async () => {
          calls.findUniqueCount += 1;
          return null;
        },
        create: async ({ data }) => {
          calls.createdUser = data;
          return { id: 'usuario-1', ...data };
        },
      },
      trabajadores: {
        create: async ({ data }) => {
          calls.createdWorker = data;
          return { id: 7, ...data };
        },
      },
    },
  };
}

function createUsuariosPrismaMock() {
  const calls = {
    updatedUser: null,
    updatedWorker: null,
  };

  return {
    calls,
    prisma: {
      usuarios: {
        findUnique: async () => null,
        update: async ({ data }) => {
          calls.updatedUser = data;
          return { id: 'usuario-1', rol: 'cliente', ...data };
        },
      },
      trabajadores: {
        updateMany: async ({ data }) => {
          calls.updatedWorker = data;
          return { count: 1 };
        },
      },
    },
  };
}

async function request(app, method, path, body) {
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const payload = JSON.stringify(body);
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      }, (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          server.close(() => {
            resolve({
              status: res.statusCode,
              body: raw ? JSON.parse(raw) : null,
            });
          });
        });
      });

      req.on('error', (error) => {
        server.close(() => reject(error));
      });
      req.end(payload);
    });
  });
}

test('POST /api/auth/register rechaza un rol manipulado como admin', async () => {
  const { prisma, calls } = createAuthPrismaMock();
  const logger = createLogger();
  const app = express();
  app.use(express.json());
  app.use('/api/auth', createAuthRouter({ prisma, logger }));

  const res = await request(app, 'POST', '/api/auth/register', {
    correo: 'persona@example.com',
    contrasena: 'secreto',
    nombre: 'Persona',
    rol: 'admin',
    permisos: ['usuarios:editar'],
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Rol no permitido para registro');
  assert.equal(calls.findUniqueCount, 0);
  assert.equal(calls.createdUser, null);
  assert.equal(logger.entries[0].args[0], '[seguridad] registro.rol_rechazado');
});

test('POST /api/auth/register normaliza rol permitido y no asigna permisos extra', async () => {
  const { prisma, calls } = createAuthPrismaMock();
  const logger = createLogger();
  const app = express();
  app.use(express.json());
  app.use('/api/auth', createAuthRouter({ prisma, logger }));

  const res = await request(app, 'POST', '/api/auth/register', {
    correo: 'trabajador@example.com',
    contrasena: 'secreto',
    nombre: 'Trabajador',
    rol: ' TRABAJADOR ',
    servicio: 'Plomeria',
    tarifa: '15000',
    descripcion: 'Servicio residencial',
    permisos: ['admin:*'],
    isAdmin: true,
  });

  assert.equal(res.status, 201);
  assert.deepEqual(calls.createdUser, {
    email: 'trabajador@example.com',
    contrase_a: 'secreto',
    rol: 'trabajador',
    nombre: 'Trabajador',
  });
  assert.deepEqual(calls.createdWorker, {
    usuario_id: 'usuario-1',
    servicio: 'Plomeria',
    tarifa: 15000,
    descripcion: 'Servicio residencial',
  });
});

test('PUT /api/usuarios/:id bloquea cambios de rol o permisos en el perfil', async () => {
  const { prisma, calls } = createUsuariosPrismaMock();
  const logger = createLogger();
  const app = express();
  app.use(express.json());
  app.use('/api/usuarios', createUsuariosRouter({ prisma, logger }));

  const res = await request(app, 'PUT', '/api/usuarios/usuario-1', {
    nombre: 'Nuevo nombre',
    rol: 'admin',
    permisos: ['usuarios:editar'],
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'No se pueden modificar campos protegidos del usuario');
  assert.deepEqual(res.body.campos, ['rol', 'permisos']);
  assert.equal(calls.updatedUser, null);
  assert.equal(calls.updatedWorker, null);
  assert.equal(logger.entries[0].args[0], '[seguridad] usuario.actualizacion_bloqueada_campos_protegidos');
});
