// hogar-api/routes/trabajadores.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const trabajadores = await prisma.trabajadores.findMany({
      include: {
        usuarios: {
          select: {
            nombre: true,
            foto_url: true,
            email: true,
            telefono: true
          }
        }
      }
    });
    res.json(trabajadores);
  } catch (err) {
    if (err.code === 'P1001') {
      return res.status(503).json({ error: '⏳ La base de datos no está disponible. Intenta en unos segundos.' });
    }
    console.error('Error al obtener trabajadores:', err);
    res.status(500).json({ error: 'Error al obtener trabajadores' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const trabajador = await prisma.trabajadores.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            nombre: true,
            foto_url: true,
            email: true,
            telefono: true
          }
        }
      }
    });

    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json(trabajador);
  } catch (err) {
    if (err.code === 'P1001') {
      return res.status(503).json({ error: '⏳ Supabase no responde. Reintenta en breve.' });
    }
    console.error('Error al obtener trabajador:', err);
    res.status(500).json({ error: 'Error al obtener trabajador' });
  }
});

module.exports = router;
