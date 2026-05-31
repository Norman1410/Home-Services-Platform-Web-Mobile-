# ADHA-02 - Mass assignment de rol/permisos

## Vulnerabilidad corregida

El endpoint `POST /api/auth/register` aceptaba el campo `rol` directamente desde el cuerpo de la solicitud. Aunque la interfaz solo muestra `cliente` y `trabajador`, una solicitud manipulada podía enviar valores como `admin`, `superadmin` o permisos inventados para intentar crear una cuenta con privilegios no previstos.

También se endureció `PUT /api/usuarios/:id`, para que un perfil no acepte intentos de modificar campos protegidos como `id`, `email`, `rol`, `permisos`, `admin`, `isAdmin` o contraseñas.

## Corrección aplicada

- Se agregó una allowlist de roles públicos: `cliente` y `trabajador`.
- El servidor normaliza el rol recibido y rechaza cualquier rol fuera de la allowlist.
- El registro construye explícitamente el objeto permitido para `usuarios.create`; no asigna `permisos`, `admin`, `isAdmin` ni campos extra enviados por el cliente.
- La actualización de perfil detecta y bloquea campos protegidos en vez de ignorarlos silenciosamente.
- Se agregaron trazas de seguridad para intentos de registro con rol inválido y actualización de campos protegidos.
- Los logs redactan campos sensibles como `contrasena`, `password`, `contrase_a` y `contraseña`.

## Pruebas automatizadas

Comando:

```bash
cd hogar-api
npm test
```

Casos cubiertos:

- `POST /api/auth/register` rechaza un body manipulado con `rol: "admin"`.
- `POST /api/auth/register` acepta `trabajador` normalizado, pero no asigna `permisos` ni `isAdmin`.
- `PUT /api/usuarios/:id` bloquea un intento de modificar `rol` y `permisos`.

## Solicitudes equivalentes a la explotación

Registro con escalación de rol:

```http
POST /api/auth/register
Content-Type: application/json

{
  "correo": "persona@example.com",
  "contrasena": "secreto",
  "nombre": "Persona",
  "rol": "admin",
  "permisos": ["usuarios:editar"]
}
```

Actualización de perfil con campos protegidos:

```http
PUT /api/usuarios/usuario-1
Content-Type: application/json

{
  "nombre": "Nuevo nombre",
  "rol": "admin",
  "permisos": ["usuarios:editar"]
}
```

## Reducción de audit poisoning

Los eventos de seguridad se registran con nombres consistentes y sin secretos en claro. Para producción, estos eventos deberían enviarse a un colector remoto o a un archivo append-only. Como mejora adicional, se puede encadenar cada evento con un hash del evento anterior para detectar alteraciones en el historial de auditoría.
