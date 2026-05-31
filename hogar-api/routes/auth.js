// hogar-api/routes/auth.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const {
  AccessControlError,
  logSecurityEvent,
  maskEmail,
  validateRegistrationRole,
} = require('../utils/accessControl');

function createAuthRouter({ prisma = new PrismaClient(), logger = console } = {}) {
  const router = express.Router();

  // Registro
  router.post('/register', async (req, res) => {
    const {
      correo,
      contrasena,
      nombre,
      servicio,
      tarifa,
      descripcion
    } = req.body;

    try {
      if (!correo || !contrasena || !nombre || !req.body.rol) {
        return res.status(400).json({ error: 'Correo, contraseña, rol y nombre son requeridos' });
      }

      const rol = validateRegistrationRole(req.body.rol);
      if (rol === 'trabajador' && (!servicio || !tarifa)) {
        return res.status(400).json({ error: 'Servicio y tarifa son requeridos para trabajadores' });
      }

      const existe = await prisma.usuarios.findUnique({
        where: { email: correo }
      });
      if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          email: correo,
          contrase_a: contrasena,
          rol,
          nombre
        }
      });

      if (rol === 'trabajador') {
        await prisma.trabajadores.create({
          data: {
            usuario_id: nuevoUsuario.id,
            servicio,
            tarifa: parseInt(tarifa, 10),
            descripcion
          }
        });
      }

      res.status(201).json(nuevoUsuario);
    } catch (err) {
      if (err instanceof AccessControlError) {
        logSecurityEvent(logger, 'registro.rol_rechazado', {
          correo: maskEmail(correo),
          rol_recibido: req.body.rol,
          motivo: err.code,
        });
        return res.status(err.statusCode).json({ error: err.message });
      }

      console.error(err);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
      const usuario = await prisma.usuarios.findUnique({
        where: { email: correo }
      });

      if (!usuario || usuario.contrase_a !== contrasena)
        return res.status(401).json({ error: 'Credenciales incorrectas' });

      res.json(usuario);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en el login' });
    }
  });

  return router;
}

module.exports = createAuthRouter();
module.exports.createAuthRouter = createAuthRouter;
