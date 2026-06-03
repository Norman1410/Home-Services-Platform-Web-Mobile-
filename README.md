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

### ADHA-01 — Contraseñas en texto plano

```powershell
$url = "http://localhost:4000/api"
$email = "test-$(Get-Random)@example.com"
$pass = "TestPass123!"

# Registrar
$reg = Invoke-RestMethod -Uri "$url/auth/register" -Method Post `
  -Body (@{correo=$email; contrasena=$pass; nombre="Test"} | ConvertTo-Json) `
  -ContentType "application/json" -ErrorAction SilentlyContinue

# Login y verificar si expone contraseña
$login = Invoke-RestMethod -Uri "$url/auth/login" -Method Post `
  -Body (@{correo=$email; contrasena=$pass} | ConvertTo-Json) `
  -ContentType "application/json" -ErrorAction SilentlyContinue

$json = $login | ConvertTo-Json
if ($json -match "contrasena|password") {
    Write-Host "[VULNERABLE] Contraseña expuesta" -ForegroundColor Red
} else {
    Write-Host "[✓] Parche aplicado" -ForegroundColor Green
}
```

### ADHA-02 — Mass assignment de rol/permisos

```powershell
$url = "http://localhost:4000/api"
$email = "test-$(Get-Random)@example.com"
$pass = "TestPass123!"

# Intento 1: Registrarse como admin
$reg = Invoke-RestMethod -Uri "$url/auth/register" -Method Post `
  -Body (@{correo=$email; contrasena=$pass; nombre="Test"; rol="admin"} | ConvertTo-Json) `
  -ContentType "application/json" -ErrorAction SilentlyContinue

if ($reg.usuario.rol -eq "admin") {
    Write-Host "[VULNERABLE] Rol admin asignado" -ForegroundColor Red
} else {
    Write-Host "[✓] Rol normalizado: $($reg.usuario.rol)" -ForegroundColor Green
}

# Intento 2: Modificar campos protegidos
$uid = $reg.usuario.id
$token = $reg.token
$upd = Invoke-RestMethod -Uri "$url/usuarios/$uid" -Method Put `
  -Body (@{rol="admin"} | ConvertTo-Json) `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $token"} -ErrorAction SilentlyContinue

if ($upd.usuario.rol -eq "admin") {
    Write-Host "[VULNERABLE] Rol modificado a admin" -ForegroundColor Red
} else {
    Write-Host "[✓] Rol protegido" -ForegroundColor Green
}
```

### Tests automatizados

```powershell
cd hogar-api
npm test                                            # Suite completa
npm test -- usuarios-password-exposure.test.js      # ADHA-01
npm test -- ofertas-access-control.test.js          # ADHA-02
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

#### ADHA-01 — Almacenamiento e inserción de contraseñas en texto plano

**Rama:** `feature/ADHA-01-contrasena-texto-plano`  
**Archivos modificados:** `hogar-api/utils/auth.js`, `hogar-api/routes/auth.js`, `hogar-api/routes/usuarios.js`  
**Clasificación:** CWE-256: Unprotected Storage of Credentials / OWASP A02:2021-Cryptographic Failures  

_Descripción del problema y corrección aplicada:_  
El sistema originalmente almacenaba las contraseñas en texto claro dentro de la base de datos PostgreSQL tras el registro, y las exponía explícitamente en los payloads JSON de respuesta de los endpoints de autenticación y lectura de perfiles. 

Para remediarlo, se implementó un mecanismo robusto de hashing utilizando la librería nativa `crypto.scrypt` combinada con la generación de sales (*salts*) aleatorias únicas por registro. Asimismo, se integró una función de sanitización recursiva (`redactSensitiveData`) en la capa del servidor para purgar e interceptar el campo de la credencial en estructuras complejas u objetos anidados antes de serializar cualquier respuesta HTTP, reduciendo a cero el radio de exposición del secreto en la red.

**Tests:** `hogar-api/test/usuarios-password-exposure.test.js` — Pruebas unitarias de encriptación, validación de hashing, rechazo de credenciales incorrectas y sanitización integradas con éxito.
- `✔ GET /api/usuarios/:id no debe exponer la contraseña`
- `✔ PUT /api/usuarios/:id no debe exponer la contraseña tras actualizar`
- `✔ hashPassword guarda un hash verificable y no el texto plano`
- `✔ verifyPassword rechaza una contrasena incorrecta`
- `✔ verifyPassword detecta credenciales antiguas en texto plano para migrarlas`
- `✔ redactSensitiveData elimina contrasenas en respuestas anidadas`

---

#### ADHA-02 — Mass Assignment en asignación de roles y permisos

**Rama:** `feature/ADHA-02-mass-assignment-rol-permisos`  
**Archivos modificados:** `hogar-api/routes/auth.js`, `hogar-api/routes/usuarios.js`  
**Clasificación:** CWE-915: Improper Modification of Dynamically-Determined Object Attributes / OWASP A01:2021-Broken Access Control  

_Descripción del problema y corrección aplicada:_  
Los endpoints de registro (`POST /api/auth/register`) y actualización de perfil (`PUT /api/usuarios/:id`) vinculaban masivamente el cuerpo de las solicitudes entrantes (`req.body`) de forma directa hacia el ORM (Prisma). Esto permitía que un atacante interceptara y manipulara los payloads HTTP para inyectar propiedades privilegiadas como `"rol": "admin"` o arreglos de `"permisos"`, logrando una escalación de privilegios vertical inmediata.

La corrección se basó en el principio de diseño seguro de asignación explícita mediante una *allowlist* en el servidor. Se modificaron los controladores para desestructurar estrictamente los campos permitidos y reconstruir los objetos de transferencia de datos de forma controlada. Cualquier parámetro extendido de control de acceso enviado maliciosamente por el cliente es proactivamente ignorado y descartado antes de interactuar con la persistencia.

**Tests:** `hogar-api/test/auth-mass-assignment.test.js` — Pruebas de integración destinadas al aseguramiento del modelo de control de acceso basado en roles (RBAC).
- `✔ POST /api/auth/register rechaza un body manipulado con rol: admin`
- `✔ POST /api/auth/register acepta trabajador normalizado pero no asigna permisos ni isAdmin`
- `✔ PUT /api/usuarios/:id bloquea un intento de modificar rol y permisos`

---

---

### Nicole Alejandra Marín Vallejos

#### NMV-01 — Aplicaciones a ofertas sin autenticación

**Rama:** `feature/NAMV-01-autenticacion-aplicaciones`  
**Archivos modificados:** `hogar-api/routes/aplicaciones.js`  
**Clasificación:** OWASP A01:2021 Broken Access Control · CWE-284 Improper Access Control

_Descripción del problema y corrección aplicada:_  
El endpoint `POST /api/aplicaciones/aplicar` aceptaba solicitudes sin autenticación y confiaba en el `trabajador_id` enviado por el cliente. Se agregó `requireAuth` y `requireRole('trabajador')` en el router, y el `trabajador_id` ahora se determina exclusivamente desde `req.auth.userId` a partir del token firmado. Si el usuario autenticado no tiene un registro de trabajador asociado, la petición se rechaza con `403`.

**Tests:** Evidencia documentada en el informe técnico; la verificación confirma que el endpoint ya no acepta peticiones sin token y que no permite aplicar a ofertas usando un `trabajador_id` falso.

---

#### NMV-02 — Política CORS permisiva sin restricción de origen

**Rama:** `feature/NAMV-02-restrict-cors`  
**Archivos modificados:** `hogar-api/index.js`  
**Clasificación:** OWASP A05:2021 Security Misconfiguration · CWE-942 Permissive Cross-domain Policy

_Descripción del problema y corrección aplicada:_  
El servidor tenía `app.use(cors())` sin configuración, lo que exponía la API a solicitudes cross-origin desde cualquier dominio. Se reemplazó por una política de lista blanca de orígenes permitidos, leída desde la variable de entorno `CORS_ALLOWED_ORIGINS`, y los orígenes no autorizados ya no reciben la cabecera `Access-Control-Allow-Origin`.

**Tests:** Evidencia documentada en el informe técnico; se comprobó que un origen malicioso queda bloqueado y que `http://localhost:3000` sigue funcionando correctamente.
