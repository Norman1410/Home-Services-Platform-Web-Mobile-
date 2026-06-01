// routes/valoraciones.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

function buildValoracionesRouter(prismaClient = prisma) {
  const router = express.Router();

  // POST /api/valoraciones
  // CORRECCIÓN AM-05: requireAuth obliga a presentar token firmado.
  // cliente_id se extrae de req.auth.userId (token), ignorando el body.
  // Antes: cliente_id venía del body sin validación, permitiendo suplantar a otro usuario.
  router.post('/', requireAuth, async (req, res) => {
    const { comentario, calificacion, trabajador_id } = req.body;
    const cliente_id = req.auth.userId; // ← del token, nunca del body

    try {
      const nueva = await prismaClient.valoraciones.create({
        data: {
          comentario,
          calificacion,
          trabajadores: {
            connect: { id: parseInt(trabajador_id) }
          },
          usuarios: {
            connect: { id: cliente_id }
          }
        }
      });
      res.json(nueva);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear valoración' });
    }
  });

  // GET /api/valoraciones/trabajador/:id
  router.get('/trabajador/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const valoraciones = await prismaClient.valoraciones.findMany({
        where: { trabajador_id: parseInt(id) },
        include: { usuarios: true }
      });
      res.json(valoraciones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener valoraciones' });
    }
  });

  return router;
}

module.exports = buildValoracionesRouter();
module.exports.buildValoracionesRouter = buildValoracionesRouter;