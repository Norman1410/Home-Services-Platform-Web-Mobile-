// hogar-api/routes/auth.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const {
  AccessControlError,
  logSecurityEvent: logAccessControlEvent,
  maskEmail,
  validateRegistrationRole,
} = require('../utils/accessControl');
const {
  hashPassword,
  logSecurityEvent: logAuthEvent,
  PUBLIC_USER_SELECT,
  redactSensitiveData,
  verifyPassword,
} = require('../utils/security');
const {
  createSessionToken,
  toSafeUser,
} = require('../lib/security/session');

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
      descripcion,
    } = req.body;

    try {
      if (!correo || !contrasena || !nombre || !req.body.rol) {
        return res.status(400).json({ error: 'Correo, contraseña, rol y nombre son requeridos' });
      }

      const rol = validateRegistrationRole(req.body.rol);
      if (rol === 'trabajador' && (!servicio || !tarifa)) {
        return res.status(400).json({ error: 'Servicio y tarifa son requeridos para trabajadores' });
      }

      logAuthEvent(logger, 'registro.intentado', {
        correo: maskEmail(correo),
        rol,
      });

      const existe = await prisma.usuarios.findUnique({
        where: { email: correo },
      });
      if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          email: correo,
          contrase_a: await hashPassword(contrasena),
          rol,
          nombre,
        },
        select: PUBLIC_USER_SELECT,
      });

      if (rol === 'trabajador') {
        await prisma.trabajadores.create({
          data: {
            usuario_id: nuevoUsuario.id,
            servicio,
            tarifa: parseInt(tarifa, 10),
            descripcion,
          },
        });
      }

      logAuthEvent(logger, 'registro.exitoso', {
        usuario_id: nuevoUsuario.id,
        rol: nuevoUsuario.rol,
      });

      const usuario = toSafeUser(redactSensitiveData(nuevoUsuario));
      return res.status(201).json({
        usuario,
        token: createSessionToken(usuario),
      });
    } catch (err) {
      if (err instanceof AccessControlError) {
        logAccessControlEvent(logger, 'registro.rol_rechazado', {
          correo: maskEmail(correo),
          rol_recibido: req.body.rol,
          motivo: err.code,
        });
        return res.status(err.statusCode).json({ error: err.message });
      }

      console.error(err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
      if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
      }

      logAuthEvent(logger, 'login.intentado', {
        correo: maskEmail(correo),
      });

      const usuario = await prisma.usuarios.findUnique({
        where: { email: correo },
      });

      if (!usuario) {
        logAuthEvent(logger, 'login.fallido', {
          correo: maskEmail(correo),
          motivo: 'usuario_no_encontrado',
        });
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const resultado = await verifyPassword(contrasena, usuario.contrase_a);
      if (!resultado.valid) {
        logAuthEvent(logger, 'login.fallido', {
          usuario_id: usuario.id,
          motivo: 'credencial_incorrecta',
        });
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      if (resultado.needsRehash) {
        await prisma.usuarios.update({
          where: { id: usuario.id },
          data: { contrase_a: await hashPassword(contrasena) },
        });
        logAuthEvent(logger, 'password.migrado_a_hash', {
          usuario_id: usuario.id,
        });
      }

      logAuthEvent(logger, 'login.exitoso', {
        usuario_id: usuario.id,
        rol: usuario.rol,
      });

      const usuarioSeguro = toSafeUser(redactSensitiveData(usuario));
      return res.json({
        usuario: usuarioSeguro,
        token: createSessionToken(usuarioSeguro),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error en el login' });
    }
  });

  return router;
}

module.exports = createAuthRouter();
module.exports.createAuthRouter = createAuthRouter;
