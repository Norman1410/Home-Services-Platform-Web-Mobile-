// routes/valoraciones.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear valoración
router.post('/', async (req, res) => {
  const { comentario, calificacion, trabajador_id, cliente_id } = req.body;

  try {
    const nueva = await prisma.valoraciones.create({
      data: {
        comentario,
        calificacion,
        trabajador_id,
        cliente_id,
      },
    });
    res.json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear la valoración' });
  }
});

// Obtener valoraciones por trabajador
router.get('/trabajador/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const valoraciones = await prisma.valoraciones.findMany({
      where: { trabajador_id: parseInt(id) },
      include: {
        usuarios: {
          select: { nombre: true }
        }
      },
      orderBy: { creado_en: 'desc' }
    });
    res.json(valoraciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener valoraciones' });
  }
});

module.exports = router;
