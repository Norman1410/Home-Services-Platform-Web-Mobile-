const request = require('supertest');
const express = require('express');
const cors = require('cors');

function buildAppWithCors(corsOptions) {
  const app = express();
  app.use(cors(corsOptions));
  app.get('/api/ofertas', (req, res) => {
    res.json({ ok: true });
  });
  return app;
}

const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:19006'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado: origen no permitido — ${origin}`));
    }
  },
  credentials: true,
};

const app = buildAppWithCors(corsOptions);

describe('CORS restriction - NAMV-02', () => {

  test('Origen permitido recibe Access-Control-Allow-Origin correcto', async () => {
    const res = await request(app)
      .get('/api/ofertas')
      .set('Origin', 'http://localhost:3000');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  test('Origen malicioso no recibe Access-Control-Allow-Origin', async () => {
    const res = await request(app)
      .get('/api/ofertas')
      .set('Origin', 'https://sitio-malicioso.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('Sin origen (curl/Postman) funciona correctamente', async () => {
    const res = await request(app)
      .get('/api/ofertas');

    expect(res.status).toBe(200);
  });

});