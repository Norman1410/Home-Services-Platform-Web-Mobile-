// hogar-api/routes/auth.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const {
  hashPassword,
  logSecurityEvent,
  maskEmail,
  PUBLIC_USER_SELECT,
  redactSensitiveData,
  verifyPassword,
} = require('../utils/security');
const {
  createSessionToken,
  toSafeUser,
} = require('../lib/security/session');

const router = express.Router();
const prisma = new PrismaClient();

// Registro
router.post('/register', async (req, res) => {
  const {
    correo,
    contrasena,
    rol,
    nombre,
    servicio,
    tarifa,
    descripcion
  } = req.body;

  try {
    if (!correo || !contrasena || !rol || !nombre) {
      return res.status(400).json({ error: 'Correo, contraseña, rol y nombre son requeridos' });
    }

    logSecurityEvent(console, 'registro.intentado', {
      correo: maskEmail(correo),
      rol,
    });

    const existe = await prisma.usuarios.findUnique({
      where: { email: correo }
    });
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        email: correo,
        contrase_a: await hashPassword(contrasena),
        rol,
        nombre
      },
      select: PUBLIC_USER_SELECT,
    });

    if (rol === 'trabajador') {
      await prisma.trabajadores.create({
        data: {
          usuario_id: nuevoUsuario.id,
          servicio,
          tarifa: parseInt(tarifa),
          descripcion
        }
      });
    }

    logSecurityEvent(console, 'registro.exitoso', {
      usuario_id: nuevoUsuario.id,
      rol: nuevoUsuario.rol,
    });

    const usuario = toSafeUser(redactSensitiveData(nuevoUsuario));
    res.status(201).json({
      usuario,
      token: createSessionToken(usuario),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    logSecurityEvent(console, 'login.intentado', {
      correo: maskEmail(correo),
    });

    const usuario = await prisma.usuarios.findUnique({
      where: { email: correo }
    });

    if (!usuario) {
      logSecurityEvent(console, 'login.fallido', {
        correo: maskEmail(correo),
        motivo: 'usuario_no_encontrado',
      });
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const resultado = await verifyPassword(contrasena, usuario.contrase_a);
    if (!resultado.valid) {
      logSecurityEvent(console, 'login.fallido', {
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
      logSecurityEvent(console, 'password.migrado_a_hash', {
        usuario_id: usuario.id,
      });
    }

    logSecurityEvent(console, 'login.exitoso', {
      usuario_id: usuario.id,
      rol: usuario.rol,
    });

    const usuarioSeguro = toSafeUser(redactSensitiveData(usuario));
    res.json({
      usuario: usuarioSeguro,
      token: createSessionToken(usuarioSeguro),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el login' });
  }
});

module.exports = router;
