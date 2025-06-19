// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// GET /usuarios/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id }, // UUID, no uses parseInt
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
  }
});



// PUT /usuarios/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, foto_url } = req.body;

  try {
    const usuario = await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        foto_url, // este campo debe estar en tu modelo Prisma
      },
    });

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

module.exports = router;
