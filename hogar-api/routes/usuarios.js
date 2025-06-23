// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /usuarios/:id (incluye relación con trabajadores)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      include: {
        trabajadores: true,
      },
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

// PUT /usuarios/:id (actualiza también trabajadores si aplica)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, foto_url, telefono, servicio, tarifa, descripcion } = req.body;

  try {
    const usuario = await prisma.usuarios.update({
      where: { id },
      data: {
        nombre,
        foto_url,
        telefono
      },
    });

    // Solo actualiza si todos los datos de trabajador están presentes
    if (servicio && tarifa && descripcion) {
      await prisma.trabajadores.updateMany({
        where: { usuario_id: id },
        data: {
          servicio,
          tarifa: parseInt(tarifa),
          descripcion,
        },
      });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

module.exports = router;
