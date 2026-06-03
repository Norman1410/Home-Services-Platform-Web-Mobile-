Proyecto: NAMV-arreglos-session-exp-cors
Ramas:
- feature/NAMV-01-session-expiration
- feature/NAMV-02-restrict-cors

**Parte 2 — Corrección 1: Expiración de tokens de sesión**

Resumen ejecutivo
- Vulnerabilidad: los tokens de sesión generados por `createSessionToken()` no contenían `exp`, por lo que un token comprometido permanecía válido indefinidamente.
- Corrección aplicada: `createSessionToken()` ahora incluye `iat` y `exp` (segundos UNIX). `verifySessionToken()` valida `exp` y rechaza tokens vencidos. TTL configurable con `SESSION_TTL_SECONDS` (por defecto 86400 = 24h).

Archivos modificados
- `hogar-api/lib/security/session.js`
  - Añadida función `getSessionTTL()` y uso de `exp` en payload.
  - `verifySessionToken()` ahora comprueba expiración antes de devolver la sesión.

Variables de entorno nuevas / usadas
- `SESSION_TTL_SECONDS` (opcional) — tiempo de vida del token en segundos.
- `SESSION_SECRET` — ya usado para firmar tokens.

Cómo reproducir la versión "mala" (antes de la corrección)
1. Checkout a la rama base donde no exista la corrección.
2. Generar un token con `iat` antiguo (por ejemplo manipular el payload o usar un script) o usar un token robado.
3. Llamar a un endpoint protegido con `Authorization: Bearer <TOKEN>`.
   - Resultado: la API aceptará el token mientras la firma sea válida.

Cómo probar la versión "nueva"
1. En la rama `feature/NAMV-01-session-expiration` ejecutar:
```bash
cd hogar-api
npm install
npx prisma generate
npm test
```
2. Generar un token con `exp` en el pasado (ejemplo):
```bash
node -e "const crypto=require('crypto');const b64=(s)=>Buffer.from(s).toString('base64url');const sign=(p)=>crypto.createHmac('sha256',process.env.SESSION_SECRET||'test').update(p).digest('base64url');const payload=JSON.stringify({sub:'1111',rol:'cliente',email:'a@b.com',iat: Math.floor(Date.now()/1000)-864000,exp: Math.floor(Date.now()/1000)-864000+1});const enc=b64(payload);console.log(enc+'.'+sign(enc));"
```
3. Usar `curl` con ese token:
```bash
curl -i -H "Authorization: Bearer <TOKEN>" http://localhost:4000/api/ofertas
```
- Resultado esperado: respuesta 401 / no autorizada si el token expiró.

Comportamiento esperado tras la corrección
- Tokens generados por `createSessionToken()` serán válidos hasta `exp`.
- Tokens con `exp` en el pasado serán rechazados por `verifySessionToken()`.


**Parte 3 — Corrección 2: Restringir CORS a orígenes permitidos**

Resumen ejecutivo
- Vulnerabilidad: `app.use(cors())` permitía cualquier origen, lo cual es más permisivo de lo recomendable en entornos de producción.
- Corrección: `index.js` ahora usa `CLIENT_ORIGINS` (lista coma-separada) y valida el header `Origin`. Se permite herramientas sin `Origin` (curl/postman).

Archivos modificados
- `hogar-api/index.js`
  - Reemplazado `app.use(cors())` por un middleware con whitelist basada en `CLIENT_ORIGINS`.

Variables de entorno nuevas
- `CLIENT_ORIGINS` — lista de orígenes permitidos, p.ej. `http://localhost:3000,http://localhost:19006`.

Pruebas manuales
- Versión mala (antes):
```bash
curl -i -X OPTIONS http://localhost:4000/api/ofertas \
  -H "Origin: http://evil.example" \
  -H "Access-Control-Request-Method: POST"
```
  - Resultado: cabezera `Access-Control-Allow-Origin` permitiría origen (demostrando permisividad).

- Versión nueva (rama `feature/NAMV-02-restrict-cors`):
```bash
export CLIENT_ORIGINS="http://localhost:3000"
# Windows PowerShell
$env:CLIENT_ORIGINS="http://localhost:3000"

curl -i -X OPTIONS http://localhost:4000/api/ofertas \
  -H "Origin: http://evil.example" \
  -H "Access-Control-Request-Method: POST"
```
  - Resultado: no debe incluir `Access-Control-Allow-Origin` para `http://evil.example`.

Prácticas recomendadas
- Mantener `SESSION_SECRET` en secreto y rotarlo si se sospecha fuga.
- Ajustar `SESSION_TTL_SECONDS` según riesgo (p. ej. 1h para tokens de mayor lateralidad).
- Probar CORS con los dominios reales de despliegue y documentarlos en CI/CD.


Notas de commit y ramas
- `feature/NAMV-01-session-expiration`: cambios en `hogar-api/lib/security/session.js`.
- `feature/NAMV-02-restrict-cors`: cambios en `hogar-api/index.js`.

---
Fin del documento. Copia y pega en tu archivo Word en las partes 2 y 3.
