// routes/usuarios.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const {
  findProtectedUserFields,
  logSecurityEvent,
} = require('../utils/accessControl');

function createUsuariosRouter({ prisma = new PrismaClient(), logger = console } = {}) {
  const router = express.Router();

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
      if (error.code === 'P1001') {
        return res.status(503).json({ error: '⏳ Base de datos no disponible. Inténtalo en unos segundos.' });
      }
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const protectedFields = findProtectedUserFields(req.body);
    if (protectedFields.length > 0) {
      logSecurityEvent(logger, 'usuario.actualizacion_bloqueada_campos_protegidos', {
        usuario_id: id,
        campos: protectedFields,
      });
      return res.status(400).json({
        error: 'No se pueden modificar campos protegidos del usuario',
        campos: protectedFields,
      });
    }

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

      if (servicio && tarifa && descripcion) {
        await prisma.trabajadores.updateMany({
          where: { usuario_id: id },
          data: {
            servicio,
            tarifa: parseInt(tarifa, 10),
            descripcion,
          },
        });
      }

      res.json(usuario);
    } catch (error) {
      if (error.code === 'P1001') {
        return res.status(503).json({ error: '⏳ No se puede actualizar. La base de datos no responde.' });
      }
      console.error(error);
      res.status(500).json({ error: 'No se pudo actualizar el perfil' });
    }
  });

  return router;
}

module.exports = createUsuariosRouter();
module.exports.createUsuariosRouter = createUsuariosRouter;
