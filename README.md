# Home Services Platform — Seguridad del Software

Plataforma web y móvil para conectar clientes con trabajadores de servicios domésticos.  
Este repositorio contiene además las correcciones de seguridad implementadas como parte de la Tarea Programada del curso **IC-8071 Seguridad del Software — GR 50, TEC, Semestre I 2026**.

---

## Tabla de contenidos

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)
4. [Cómo ejecutar los tests](#cómo-ejecutar-los-tests)
5. [Scripts de reproducción de vulnerabilidades](#scripts-de-reproducción-de-vulnerabilidades)
6. [Aportes por estudiante](#aportes-por-estudiante)
   - [Norman Eduardo Sáenz Apezteguia](#norman-eduardo-sáenz-apezteguia)
   - [Emmanuel Jiménez Salas](#emmanuel-jiménez-salas)
   - [Angélica Dolly Harmon Arias](#angélica-dolly-harmon-arias)
   - [Nicole Alejandra Marín Vallejos](#nicole-alejandra-marín-vallejos)

---

## Descripción del proyecto

Sistema de intermediación digital que permite a clientes publicar ofertas de trabajo doméstico y a trabajadores independientes postularse. La plataforma gestiona perfiles, aplicaciones, valoraciones e imágenes de perfil.

**Actores:** Cliente · Trabajador · Equipo técnico/admin  
**Infraestructura:** Backend API REST + Web React + App React Native/Expo + PostgreSQL en Supabase

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js 20 + Express 5 |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL (Supabase) |
| Auth y Storage | Supabase |
| Frontend web | React 18 + Tailwind CSS |
| App móvil | React Native / Expo |
| Tokens de sesión | HMAC-SHA256 propio (`lib/security/session.js`) |

---

## Cómo levantar el proyecto

### Requisitos previos

- Node.js 20 o superior
- npm 9 o superior
- Cuenta en Supabase con el proyecto configurado

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Home-Services-Platform-Web-Mobile-
```

### 2. Configurar variables de entorno — Backend

Crear el archivo `hogar-api/.env` con las siguientes variables:

```env
DATABASE_URL="postgresql://..."   # URL de conexión a Supabase
SESSION_SECRET="una-clave-secreta-robusta-minimo-32-caracteres"
PORT=4000
```

> ⚠️ Nunca subir el archivo `.env` al repositorio. Está incluido en `.gitignore`.

### 3. Instalar dependencias y ejecutar migraciones — Backend

```bash
cd hogar-api
npm install
npx prisma generate
node index.js
```

El servidor queda disponible en `http://localhost:4000`.

### 4. Configurar variables de entorno — Frontend web

Crear el archivo `hogar-web/.env` con:

```env
REACT_APP_API_URL=http://localhost:4000
```

### 5. Instalar dependencias y levantar — Frontend web

```bash
cd hogar-web
npm install
npm start
```

La aplicación web queda disponible en `http://localhost:3000`.

### 6. Levantar la app móvil (opcional)

```bash
cd hogar-movil
npm install
npx expo start
```

---

## Cómo ejecutar los tests

### Tests del backend (Node.js native test runner)

```bash
cd hogar-api
npm test
```

Esto ejecuta todos los archivos en `hogar-api/test/`. La salida esperada es:

```
✔ POST /api/ofertas ignores spoofed cliente_id and uses the signed session user
✔ POST /api/ofertas rejects unauthenticated requests
✔ Test 1 — GET /api/usuarios/:id no debe exponer la contraseña
✔ Test 2 — PUT /api/usuarios/:id no debe exponer la contraseña tras actualizar
✔ POST /api/valoraciones rechaza petición sin token (401)
✔ POST /api/valoraciones ignora cliente_id del body y usa el del token
✔ POST /api/valoraciones con token válido crea la valoración correctamente
ℹ tests 7  |  pass 7  |  fail 0
```

Para ejecutar solo los tests de una corrección específica:

```bash
# Solo correcciones de Norman (NESA-01)
node --test test/ofertas-access-control.test.js

# Solo correcciones de Emmanuel (EJS-01)
node --test test/usuarios-password-exposure.test.js

# Solo correcciones de Emmanuel (EJS-02)
node --test test/valoraciones-auth-validation.test.js
```

### Tests del frontend web (Jest + React Testing Library)

```bash
cd hogar-web
npm test
```

Salida esperada:

```
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
```

---

## Scripts de reproducción de vulnerabilidades

Los siguientes comandos PowerShell reproducen las vulnerabilidades **antes** del parche y verifican que estén **corregidas después**. Ejecutarlos únicamente en el entorno local del proyecto.

### NESA-01 — Suplantación al crear ofertas

```powershell
# ANTES (rama evidencia/version-vulnerable-base):
# La oferta se crea con el cliente_id de la víctima enviado en el body
$victimaId = "52be19bf-0eb1-4057-a366-438cd3b2a967"
$body = @{ cliente_id=$victimaId; titulo="Prueba"; descripcion="Ataque";
           servicio_requerido="Plomeria"; ubicacion="San Jose" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/ofertas" -Method Post `
  -Body $body -ContentType "application/json"

# DESPUÉS (rama feature/NESA-01 o master):
# El backend ignora el cliente_id del body y usa el del token
$login = @{ correo="pablo.gutierrez@gmail.com"; contrasena="123456" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
  -Method Post -Body $login -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($res.token)" }
$body = @{ cliente_id=$victimaId; titulo="Prueba corregida";
           descripcion="Spoofing bloqueado"; servicio_requerido="Plomeria";
           ubicacion="San Jose" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/ofertas" -Method Post `
  -Headers $headers -Body $body -ContentType "application/json"
# Resultado: oferta creada con el ID del usuario autenticado, no el de la víctima
```

### NESA-02 — Deserialización insegura en cliente web

```
# ANTES (rama evidencia/version-vulnerable-base):
# 1. Levantar hogar-web con npm start
# 2. En la consola del navegador ejecutar:
localStorage.setItem('usuario', '{json-invalido-truncado')
# 3. Recargar la página → crash: "Unexpected end of JSON input"

# DESPUÉS (master):
# Mismo paso 2, al recargar la app detecta el JSON inválido,
# limpia localStorage y redirige al login sin crash.
# Verificar: localStorage.getItem('usuario') === null
```

### EJS-01 — Contraseña expuesta en /usuarios

```powershell
# ANTES: GET retorna contrase_a en texto plano
$reg = @{ correo="prueba.security@test.com"; contrasena="password123";
          rol="cliente"; nombre="Usuario Prueba" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
  -Method Post -Body $reg -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:4000/api/usuarios/$($res.usuario.id)" -Method Get
# Resultado vulnerable: campo contrase_a visible en la respuesta

# DESPUÉS: contrase_a ya no aparece en la respuesta
Invoke-RestMethod -Uri "http://localhost:4000/api/usuarios/$($res.usuario.id)" -Method Get
# Resultado corregido: objeto sin campo contrase_a
```

### EJS-02 — Suplantación al crear valoraciones

```powershell
# ANTES: valoración creada sin token y con cliente_id falso
$body = @{ trabajador_id=1; calificacion=5; comentario="Ataque anonimo";
           cliente_id="00000000-0000-0000-0000-000000000099" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/valoraciones" `
  -Method Post -Body $body -ContentType "application/json"
# Resultado vulnerable: 200 OK con cliente_id del atacante

# DESPUÉS — Prueba 1: sin token → 401
try {
  Invoke-RestMethod -Uri "http://localhost:4000/api/valoraciones" `
    -Method Post -Body $body -ContentType "application/json"
} catch {
  Write-Host "Status: $($_.Exception.Response.StatusCode)"
  Write-Host "Respuesta: $($_.ErrorDetails.Message)"
}
# Resultado: 401 {"error":"Sesion no valida o ausente"}

# DESPUÉS — Prueba 2: con token, cliente_id del body es ignorado
$login = @{ correo="prueba.security@test.com"; contrasena="password123" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
  -Method Post -Body $login -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($res.token)" }
$body = @{ trabajador_id=1; calificacion=5; comentario="Validacion final en vivo";
           cliente_id="00000000-0000-0000-0000-000000000099" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/valoraciones" `
  -Method Post -Body $body -ContentType "application/json" -Headers $headers
# Resultado: cliente_id en la respuesta = ID real del token, no el 000...099
```

---

## Aportes por estudiante

---

### Norman Eduardo Sáenz Apezteguia

#### NESA-01 — Control de acceso en creación de ofertas

**Rama:** `feature/NESA-01-control-acceso-ofertas`  
**Archivos modificados:** `hogar-api/routes/ofertas.js`, `hogar-api/routes/auth.js`, `hogar-api/middleware/auth.js` (nuevo), `hogar-api/lib/security/session.js` (nuevo)  
**Clasificación:** OWASP A01:2021 · CWE-639 · CWE-807

El endpoint `POST /api/ofertas` aceptaba el campo `cliente_id` directamente del body sin ninguna validación de autenticación. Esto permitía que cualquier persona enviara el ID de otro cliente y creara ofertas a su nombre.

**Corrección aplicada:**
- Se creó `middleware/auth.js` con los middlewares `requireAuth` (verifica token firmado) y `requireRole` (valida rol).
- Se creó `lib/security/session.js` con `createSessionToken`, `verifySessionToken` y `toSafeUser` usando HMAC-SHA256.
- `POST /api/ofertas` ahora requiere `requireAuth + requireRole('cliente')` y toma `cliente_id` de `req.auth.userId` ignorando el body.
- El login y registro devuelven `{ usuario, token }` sin exponer la contraseña.

**Tests:** `hogar-api/test/ofertas-access-control.test.js` — 2/2 pasando.

---

#### NESA-02 — Deserialización segura de sesión en cliente web

**Rama:** `feature/NESA-02-deserializacion-segura-cliente`  
**Archivos modificados:** `hogar-web/src/utils/session.js` (nuevo), `hogar-web/src/App.js`, `hogar-web/src/components/RutaProtegida.js`, `hogar-web/src/components/Navbar.js`  
**Clasificación:** CWE-20 · CWE-248

La aplicación web usaba `JSON.parse(localStorage.getItem('usuario'))` directamente en múltiples componentes. Si el valor estaba corrupto, vacío o manipulado, React lanzaba `Unexpected end of JSON input` y la app dejaba de renderizar completamente.

**Corrección aplicada:**
- Se creó `hogar-web/src/utils/session.js` con `getStoredUser()` que envuelve el parse en `try/catch`, valida estructura, verifica que `id` exista y que `rol` esté en lista blanca (`['cliente', 'trabajador']`).
- Si los datos son inválidos, se limpia `localStorage` automáticamente y la app regresa al login sin crash.
- `App.js`, `RutaProtegida` y `Navbar` fueron actualizados para usar el helper en lugar del parse directo.

**Tests:** `hogar-web/src/utils/session.test.js` — 4/4 pasando (Test Suites: 2, Tests: 4).

---

### Emmanuel Jiménez Salas

#### EJS-01 — Exclusión de contraseña en respuestas de /usuarios

**Rama:** `feature/EJS-01-ocultar-exposicion-password`  
**Archivos modificados:** `hogar-api/routes/usuarios.js`, `hogar-api/test/usuarios-password-exposure.test.js` (nuevo)  
**Clasificación:** OWASP A02:2021 · CWE-200 · CWE-312

`GET /api/usuarios/:id` y `PUT /api/usuarios/:id` ejecutaban consultas Prisma sin `select` explícito, devolviendo el objeto completo del modelo incluyendo el campo `contrase_a` en texto plano en la respuesta JSON al cliente.

**Corrección aplicada:**
- `GET /:id`: se reemplazó `include` sin restricciones por `select` explícito que enumera únicamente los campos seguros (`id`, `nombre`, `email`, `rol`, `foto_url`, `telefono`, `creado_en`, `trabajadores`), omitiendo `contrase_a` de forma declarativa.
- `PUT /:id`: se aplica `toSafeUser()` —ya existente en `lib/security/session.js` desde NESA-01— sobre la respuesta del `update` antes de enviarla al cliente, garantizando que ninguna actualización devuelva el campo sensible.

**Tests:** `hogar-api/test/usuarios-password-exposure.test.js` — 2/2 pasando.

```
✔ Test 1 — GET /api/usuarios/:id no debe exponer la contraseña (6379ms)
✔ Test 2 — PUT /api/usuarios/:id no debe exponer la contraseña tras actualizar (563ms)
```

---

#### EJS-02 — Validación de cliente en creación de valoraciones

**Rama:** `feature/EJS-02-validar-cliente-valoracion`  
**Archivos modificados:** `hogar-api/routes/valoraciones.js`, `hogar-web/src/pages/DetalleTrabajador.js`, `hogar-api/test/valoraciones-auth-validation.test.js` (nuevo)  
**Clasificación:** OWASP A01:2021 · CWE-639 · CWE-284 · AM-05

`POST /api/valoraciones` no requería autenticación y tomaba `cliente_id` del body sin validación. Habilitaba dos vectores: crear valoraciones sin estar autenticado, y enviar el ID de otra persona para crear valoraciones falsas a su nombre (parameter tampering).

**Corrección aplicada:**
- **Backend:** se agrega `requireAuth` al endpoint. `cliente_id` se extrae de `req.auth.userId` (token firmado) e ignora completamente el body. El router adopta el patrón `buildValoracionesRouter(prismaClient)` para inyección de dependencia en tests, consistente con el patrón de NESA-01.
- **Frontend:** `DetalleTrabajador.js` elimina `cliente_id` del body y agrega el header `Authorization: Bearer <token>`.

**Tests:** `hogar-api/test/valoraciones-auth-validation.test.js` — 3/3 pasando.

```
✔ POST /api/valoraciones rechaza petición sin token (401) (201ms)
✔ POST /api/valoraciones ignora cliente_id del body y usa el del token (42ms)
✔ POST /api/valoraciones con token válido crea la valoración correctamente (26ms)
```

---

### Angélica Dolly Harmon Arias

> ⚠️ **Esta sección será completada por Angélica Harmon.**

#### HAD-01 — [Nombre de la corrección]

**Rama:** `feature/HAD-01-...`  
**Archivos modificados:** ...  
**Clasificación:** ...

_Descripción del problema y corrección aplicada._

**Tests:** ...

---

#### HAD-02 — [Nombre de la corrección]

**Rama:** `feature/HAD-02-...`  
**Archivos modificados:** ...  
**Clasificación:** ...

_Descripción del problema y corrección aplicada._

**Tests:** ...

---

### Nicole Alejandra Marín Vallejos

> ⚠️ **Esta sección será completada por Nicole Marín.**

#### NMV-01 — [Nombre de la corrección]

**Rama:** `feature/NMV-01-...`  
**Archivos modificados:** ...  
**Clasificación:** ...

_Descripción del problema y corrección aplicada._

**Tests:** ...

---

#### NMV-02 — [Nombre de la corrección]

**Rama:** `feature/NMV-02-...`  
**Archivos modificados:** ...  
**Clasificación:** ...

_Descripción del problema y corrección aplicada._

**Tests:** ...
