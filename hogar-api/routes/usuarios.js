// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { toSafeUser } = require('../lib/security/session');

const prisma = new PrismaClient();

// GET /api/usuarios/:id
// CORRECCIÓN AM-06: se usa select explícito para excluir contrase_a.
// Antes: include sin select devolvía todos los campos incluyendo contrase_a en texto plano.
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        foto_url: true,
        telefono: true,
        creado_en: true,
        trabajadores: true,
        // contrase_a: omitido intencionalmente
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    if (error.code === 'P1001') {
      return res.status(503).json({ error: '⏳ Base de datos no disponible. Inténtalo en unos segundos.' });
    }
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
  }
});

// PUT /api/usuarios/:id
// CORRECCIÓN AM-06: se aplica toSafeUser() a la respuesta del update
// para garantizar que contrase_a nunca llegue al cliente.
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, foto_url, telefono, servicio, tarifa, descripcion } = req.body;

  try {
    const usuario = await prisma.usuarios.update({
      where: { id },
      data: {
        nombre,
        foto_url,
        telefono,
      },
    });

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

    res.json(toSafeUser(usuario));
  } catch (error) {
    if (error.code === 'P1001') {
      return res.status(503).json({ error: '⏳ No se puede actualizar. La base de datos no responde.' });
    }
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

module.exports = router;