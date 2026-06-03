const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PUBLIC_USER_SELECT, redactSensitiveData } = require('../utils/security');
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

function buildAplicacionesRouter(prismaClient = prisma) {
  const router = express.Router();

  // POST /api/aplicaciones/aplicar
  router.post('/aplicar', requireAuth, requireRole('trabajador'), async (req, res) => {
    const { oferta_id } = req.body;

    try {
      const trabajador = await prismaClient.trabajadores.findFirst({
        where: { usuario_id: req.auth.userId }
      });

      if (!trabajador) {
        return res.status(403).json({ error: 'No eres un trabajador registrado' });
      }

      const trabajador_id = trabajador.id;

      const yaExiste = await prismaClient.aplicaciones.findFirst({
        where: { oferta_id, trabajador_id }
      });

      if (yaExiste) {
        return res.status(400).json({ error: 'Ya aplicaste a esta oferta' });
      }

      const nueva = await prismaClient.aplicaciones.create({
        data: { oferta_id, trabajador_id }
      });

      res.status(201).json(nueva);
    } catch (err) {
      console.error('Error al aplicar a la oferta:', err);
      res.status(500).json({ error: 'No se pudo aplicar a la oferta' });
    }
  });

  // GET /api/aplicaciones/oferta/:id
  router.get('/oferta/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const aplicaciones = await prismaClient.aplicaciones.findMany({
        where: { oferta_id: parseInt(id) },
        include: {
          trabajadores: {
            include: {
              usuarios: {
                select: PUBLIC_USER_SELECT
              }
            }
          }
        }
      });

      res.json(redactSensitiveData(aplicaciones));
    } catch (err) {
      console.error('Error al obtener aplicaciones:', err);
      res.status(500).json({ error: 'Error al cargar aplicaciones' });
    }
  });

  // PATCH /api/aplicaciones/:id/aceptar
  router.patch('/:id/aceptar', async (req, res) => {
    const { id } = req.params;

    try {
      const aceptada = await prismaClient.aplicaciones.update({
        where: { id: parseInt(id) },
        data: { estado: 'aceptada' }
      });

      await prismaClient.aplicaciones.updateMany({
        where: {
          oferta_id: aceptada.oferta_id,
          NOT: { id: aceptada.id }
        },
        data: { estado: 'rechazada' }
      });

      await prismaClient.ofertas_trabajo.update({
        where: { id: aceptada.oferta_id },
        data: { estado: 'aceptada' }
      });

      res.json({ ok: true });
    } catch (err) {
      console.error('Error al aceptar aplicación:', err);
      res.status(500).json({ error: 'No se pudo aceptar la aplicación' });
    }
  });

  // PATCH /api/aplicaciones/:id/rechazar
  router.patch('/:id/rechazar', async (req, res) => {
    const { id } = req.params;

    try {
      await prismaClient.aplicaciones.update({
        where: { id: parseInt(id) },
        data: { estado: 'rechazada' }
      });

      res.json({ ok: true });
    } catch (err) {
      console.error('Error al rechazar aplicación:', err);
      res.status(500).json({ error: 'No se pudo rechazar la aplicación' });
    }
  });

  // DELETE /api/aplicaciones/:id
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      await prismaClient.aplicaciones.delete({
        where: { id: parseInt(id) }
      });

      res.json({ ok: true });
    } catch (err) {
      console.error('Error al eliminar aplicación:', err);
      res.status(500).json({ error: 'No se pudo eliminar la aplicación' });
    }
  });

  // GET /api/aplicaciones
  router.get('/', async (req, res) => {
    try {
      const aplicaciones = await prismaClient.aplicaciones.findMany({
        include: {
          ofertas_trabajo: true
        },
      });
      res.json(aplicaciones);
    } catch (err) {
      console.error('Error al obtener aplicaciones:', err);
      res.status(500).json({ error: 'Error al cargar aplicaciones' });
    }
  });

  return router;
}

module.exports = buildAplicacionesRouter();
module.exports.buildAplicacionesRouter = buildAplicacionesRouter;