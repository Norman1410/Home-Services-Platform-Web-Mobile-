// hogar-api/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import { PrismaClient } from '@prisma/client'
import trabajadoresRoutes from './routes/trabajadores.js'

dotenv.config()
const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())
app.use('/api/trabajadores', trabajadoresRoutes)

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`)
})
