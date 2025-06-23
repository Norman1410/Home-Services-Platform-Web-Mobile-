const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/aplicaciones/aplicar
router.post('/aplicar', async (req, res) => {
  const { oferta_id, trabajador_id } = req.body;

  try {
    const yaExiste = await prisma.aplicaciones.findFirst({
      where: { oferta_id, trabajador_id }
    });

    if (yaExiste) {
      return res.status(400).json({ error: 'Ya aplicaste a esta oferta' });
    }

    const nueva = await prisma.aplicaciones.create({
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
    const aplicaciones = await prisma.aplicaciones.findMany({
      where: { oferta_id: parseInt(id) },
      include: {
        trabajadores: { // ✅ nombre correcto del modelo
          include: {
            usuarios: true // ✅ incluir los datos del usuario
          }
        }
      }
    });

    res.json(aplicaciones);
  } catch (err) {
    console.error('Error al obtener aplicaciones:', err);
    res.status(500).json({ error: 'Error al cargar aplicaciones' });
  }
});


// PATCH /api/aplicaciones/:id/aceptar
router.patch('/:id/aceptar', async (req, res) => {
  const { id } = req.params;

  try {
    const aceptada = await prisma.aplicaciones.update({
      where: { id: parseInt(id) },
      data: { estado: 'aceptada' }
    });

    // Rechazar el resto
    await prisma.aplicaciones.updateMany({
      where: {
        oferta_id: aceptada.oferta_id,
        NOT: { id: aceptada.id }
      },
      data: { estado: 'rechazada' }
    });

    await prisma.ofertas_trabajo.update({
      where: { id: aceptada.oferta_id },
      data: { estado: 'aceptada' }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error al aceptar aplicación:', err);
    res.status(500).json({ error: 'No se pudo aceptar la aplicación' });
  }
});

module.exports = router;
