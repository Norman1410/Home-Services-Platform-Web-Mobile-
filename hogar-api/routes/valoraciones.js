const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const { PUBLIC_USER_SELECT, redactSensitiveData } = require('../utils/security');
const prisma = new PrismaClient();

// Crear nueva valoración
router.post('/', async (req, res) => {
  const { comentario, calificacion, trabajador_id, cliente_id } = req.body;

  try {
    const nueva = await prisma.valoraciones.create({
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

// Obtener valoraciones por trabajador
router.get('/trabajador/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const valoraciones = await prisma.valoraciones.findMany({
      where: {
        trabajador_id: parseInt(id)
      },
      include: {
        usuarios: {
          select: PUBLIC_USER_SELECT
        }
      }
    });
    res.json(redactSensitiveData(valoraciones));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener valoraciones' });
  }
});

module.exports = router;
