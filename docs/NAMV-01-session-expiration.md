# NAMV-01 — Expiración de tokens de sesión

## Objetivo
Documentar la corrección de seguridad para la rama `feature/NAMV-01-session-expiration`.

## Resumen ejecutivo
- Vulnerabilidad: `createSessionToken()` generaba tokens sin campo `exp`, por lo que un token robado permanecía válido indefinidamente.
- Corrección aplicada: se agrega `exp` en el payload del token y `verifySessionToken()` rechaza tokens expirados.
- Configuración: el TTL del token se controla con `SESSION_TTL_SECONDS` y por defecto es `86400` segundos (24h).

## Archivos modificados
- `hogar-api/lib/security/session.js`
  - Se agregó la función `getSessionTTL()`.
  - `createSessionToken()` ahora usa `iat` y `exp`.
  - `verifySessionToken()` valida que `payload.exp` no haya pasado.

## Variables de entorno
- `SESSION_SECRET`: ya existente, se usa para la firma HMAC.
- `SESSION_TTL_SECONDS`: nuevo, controla la duración del token en segundos.

## Pruebas realizadas
1. `cd hogar-api`
2. `npm install`
3. `npx prisma generate`
4. `npm test`

Resultados:
- Todos los tests pasaron en la rama `feature/NAMV-01-session-expiration`.

## Cómo probar la versión "mala"
1. Usar la rama base anterior a la corrección.
2. Generar un token con `iat` antiguo y sin expiración efectiva.
3. Consumir un endpoint protegido con ese token.
   - Resultado esperado: la API acepta el token mientras la firma sea válida.

## Cómo probar la versión "nueva"
1. Usar `feature/NAMV-01-session-expiration`.
2. Generar un token expirado:
```bash
node -e "const crypto=require('crypto');const b64=(s)=>Buffer.from(s).toString('base64url');const sign=(p)=>crypto.createHmac('sha256',process.env.SESSION_SECRET||'test').update(p).digest('base64url');const payload=JSON.stringify({sub:'1111',rol:'cliente',email:'a@b.com',iat: Math.floor(Date.now()/1000)-864000,exp: Math.floor(Date.now()/1000)-864000+1});const enc=b64(payload);console.log(enc+'.'+sign(enc));"
```
3. Enviar la petición:
```bash
curl -i -H "Authorization: Bearer <TOKEN>" http://localhost:4000/api/ofertas
```
- Resultado esperado: `401 Unauthorized` o token inválido.

## Conclusión
La primera corrección está documentada y lista para copiar en tu archivo Word. Después podemos seguir con la segunda corrección en otra rama.
