// routes/ofertas.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/ofertas
router.get('/', async (req, res) => {
  try {
    const ofertas = await prisma.ofertas_trabajo.findMany({
      where: {
        estado: 'pendiente', // opcional: puedes quitarlo si quieres mostrar todas
      },
      orderBy: { fecha_creacion: 'desc' },
    });

    res.json(ofertas);
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ error: 'Error al obtener las ofertas de trabajo' });
  }
});

// GET /api/ofertas/cliente/:cliente_id
router.get('/cliente/:cliente_id', async (req, res) => {
  const { cliente_id } = req.params;

  try {
    const ofertas = await prisma.ofertas_trabajo.findMany({
      where: {
        cliente_id,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    res.json(ofertas);
  } catch (error) {
    console.error('Error al obtener ofertas del cliente:', error);
    res.status(500).json({ error: 'Error al obtener las ofertas' });
  }
});

// PATCH /api/ofertas/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const actualizada = await prisma.ofertas_trabajo.update({
      where: { id: parseInt(id) },
      data: { estado },
    });
    res.json(actualizada);
  } catch (err) {
    console.error('Error actualizando oferta:', err);
    res.status(500).json({ error: 'Error actualizando estado de la oferta' });
  }
});


// POST /api/ofertas
router.post('/', async (req, res) => {
  try {
    const { cliente_id, titulo, descripcion, servicio_requerido, ubicacion } = req.body;

    const nuevaOferta = await prisma.ofertas_trabajo.create({
      data: {
        cliente_id,
        titulo,
        descripcion,
        servicio_requerido,
        ubicacion,
      },
    });

    res.status(201).json(nuevaOferta);
  } catch (error) {
    console.error('Error al crear oferta:', error);
    res.status(500).json({ error: 'Error al crear la oferta de trabajo' });
  }
});

// DELETE /api/ofertas/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.ofertas_trabajo.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Error al eliminar oferta:', err);
    res.status(500).json({ error: 'No se pudo eliminar la oferta' });
  }
});


module.exports = router;
