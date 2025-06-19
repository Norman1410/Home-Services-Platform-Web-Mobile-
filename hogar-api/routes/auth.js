// hogar-api/routes/auth.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

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
          tarifa: parseInt(tarifa),
          descripcion
        }
      });
    }

    res.status(201).json(nuevoUsuario);
  } catch (err) {
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

module.exports = router;
