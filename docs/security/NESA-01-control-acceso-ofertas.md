# NESA-01 - Control de acceso en creacion de ofertas

## Vulnerabilidad
La ruta `POST /api/ofertas` confiaba en el campo `cliente_id` enviado por el cliente.
Un usuario autenticado o un atacante con acceso al endpoint podia enviar el id de otro
cliente y publicar una oferta a nombre de esa persona.

## Correccion
El backend ahora emite un token de sesion firmado al iniciar sesion o registrarse. La ruta
`POST /api/ofertas` exige `Authorization: Bearer <token>`, valida que el rol sea `cliente`
y asigna `cliente_id` desde la sesion firmada (`req.auth.userId`) en vez de usar el valor
recibido en el cuerpo de la solicitud.

## Prueba
La prueba `hogar-api/test/ofertas-access-control.test.js` reproduce la solicitud vulnerable:
envia un `cliente_id` manipulado en el body y verifica que la oferta se cree con el id del
usuario autenticado por token. Tambien verifica que una solicitud sin token sea rechazada.
