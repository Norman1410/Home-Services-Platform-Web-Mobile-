// hogar-api/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const trabajadoresRoutes = require('./routes/trabajadores');
const usuariosRouter = require('./routes/usuarios');
const valoracionesRoutes = require('./routes/valoraciones');
const ofertasRouter = require('./routes/ofertas');
const aplicacionesRouter = require('./routes/aplicaciones');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Configurar CORS: sólo permitir orígenes listados en CLIENT_ORIGINS
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:3000').split(',');
app.use(express.json());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // herramientas como curl/postman sin Origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed'));
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/valoraciones', valoracionesRoutes); // ✅ AÑADIDO
app.use('/api/ofertas', ofertasRouter);
app.use('/api/aplicaciones', aplicacionesRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});

async function verificarConexionPrisma() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión a Supabase establecida correctamente.');
  } catch (err) {
    console.warn('⚠ No se pudo conectar a Supabase al iniciar:', err.message);
  }
}

verificarConexionPrisma();



// ⚠️ Manejador global para errores de Prisma (como conexión fallida a Supabase)
process.on('unhandledRejection', (reason, promise) => {
  if (reason?.code === 'P1001') {
    console.warn('\n⚠ Supabase no responde (Error P1001). Verifica tu conexión o espera que se reactive.\n');
  } else {
    console.error('💥 Error inesperado no manejado:', reason);
  }
});


