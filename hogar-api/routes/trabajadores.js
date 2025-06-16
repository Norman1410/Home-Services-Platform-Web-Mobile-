import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const trabajadores = await prisma.trabajadores.findMany({
      include: {
        usuarios: true // incluir nombre del usuario
      }
    })
    res.json(trabajadores)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener trabajadores' })
  }
})

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const trabajador = await prisma.trabajadores.findUnique({
      where: { id },
      include: {
        usuarios: true
      }
    })

    if (!trabajador) return res.status(404).json({ error: 'Trabajador no encontrado' })

    res.json(trabajador)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener trabajador' })
  }
})



export default router
