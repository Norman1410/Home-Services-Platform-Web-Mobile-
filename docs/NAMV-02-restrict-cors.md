# NAMV-02 — Restringir CORS a orígenes permitidos

## Objetivo
Documentar la corrección de seguridad para la rama `feature/NAMV-02-restrict-cors`.

## Resumen ejecutivo
- Vulnerabilidad: `app.use(cors())` aceptaba cualquier origen, lo que deja la API más expuesta a solicitudes cross-origin desde orígenes no confiables.
- Corrección aplicada: `index.js` ahora usa `CLIENT_ORIGINS` para validar la cabecera `Origin`. Solo se permiten los orígenes listados y se aceptan herramientas sin `Origin` como `curl` o Postman.

## Archivos modificados
- `hogar-api/index.js`
  - Reemplazado `app.use(cors())` por una configuración de origen permitido.
  - `CLIENT_ORIGINS` se parsea como lista coma-separada y se limpia de valores vacíos.

## Variables de entorno
- `CLIENT_ORIGINS`: lista de orígenes confiables, por ejemplo:
  - `http://localhost:3000`
  - `http://localhost:19006`
  - `https://tu-dominio-production.com`

## Cómo probar la versión "mala"
1. Usar la rama base anterior a la corrección.
2. Hacer una petición OPTIONS con un origen no permitido:
```bash
curl -i -X OPTIONS http://localhost:4000/api/ofertas \
  -H "Origin: http://evil.example" \
  -H "Access-Control-Request-Method: POST"
```
- Resultado esperado: la API responde con `Access-Control-Allow-Origin: *` o permite la carga CORS.

## Cómo probar la versión "nueva"
1. En la rama `feature/NAMV-02-restrict-cors`, exportar orígenes permitidos:
```powershell
$env:CLIENT_ORIGINS="http://localhost:3000"
```
2. Ejecutar la misma petición OPTIONS:
```bash
curl -i -X OPTIONS http://localhost:4000/api/ofertas \
  -H "Origin: http://evil.example" \
  -H "Access-Control-Request-Method: POST"
```
- Resultado esperado: la respuesta no debe incluir `Access-Control-Allow-Origin` para `http://evil.example`, y la petición debe fallar si el origen no está autorizado.

3. Probar un origen permitido:
```bash
curl -i -X OPTIONS http://localhost:4000/api/ofertas \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```
- Resultado esperado: la respuesta incluye `Access-Control-Allow-Origin: http://localhost:3000`.

## Conclusión
Esta corrección endurece la configuración CORS y protege mejor la API frente a orígenes no confiables en el navegador.
