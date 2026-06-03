const request = require('supertest');
const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { createSessionToken } = require('../lib/security/session');

// Mock de Prisma
const mockPrisma = {
  trabajadores: {
    findFirst: jest.fn(),
  },
  aplicaciones: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  ofertas_trabajo: {},
};

const { buildAplicacionesRouter } = require('../routes/aplicaciones');

// Armar app de prueba
const app = express();
app.use(express.json());
app.use('/api/aplicaciones', buildAplicacionesRouter(mockPrisma));

// Token válido de trabajador
const tokenTrabajador = createSessionToken({
  id: 'user-123',
  rol: 'trabajador',
  email: 'trabajador@test.com',
});

// Token válido de cliente
const tokenCliente = createSessionToken({
  id: 'user-456',
  rol: 'cliente',
  email: 'cliente@test.com',
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/aplicaciones/aplicar', () => {

  test('Sin token debe retornar 401', async () => {
    const res = await request(app)
      .post('/api/aplicaciones/aplicar')
      .send({ oferta_id: 1 });

    expect(res.status).toBe(401);
    expect(mockPrisma.trabajadores.findFirst).not.toHaveBeenCalled();
  });

  test('Con token de cliente debe retornar 403', async () => {
    const res = await request(app)
      .post('/api/aplicaciones/aplicar')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ oferta_id: 1 });

    expect(res.status).toBe(403);
    expect(mockPrisma.trabajadores.findFirst).not.toHaveBeenCalled();
  });

  test('trabajador_id del body es ignorado, se usa el del token', async () => {
    mockPrisma.trabajadores.findFirst.mockResolvedValue({ id: 10 });
    mockPrisma.aplicaciones.findFirst.mockResolvedValue(null);
    mockPrisma.aplicaciones.create.mockResolvedValue({
      id: 1,
      oferta_id: 59,
      trabajador_id: 10,
      estado: 'pendiente',
    });

    const res = await request(app)
      .post('/api/aplicaciones/aplicar')
      .set('Authorization', `Bearer ${tokenTrabajador}`)
      .send({ oferta_id: 59, trabajador_id: 99 }); // 99 debe ser ignorado

    expect(res.status).toBe(201);
    expect(mockPrisma.aplicaciones.create).toHaveBeenCalledWith({
      data: { oferta_id: 59, trabajador_id: 10 }, // 10 del token, no 99 del body
    });
  });

});