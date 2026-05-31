# ADHA-01 - Contraseñas en texto plano

## Vulnerabilidad corregida

Antes, `POST /api/auth/register` guardaba `contrase_a` con el valor recibido en `req.body.contrasena`. Luego, `POST /api/auth/login` comparaba ese valor directamente y devolvía el objeto completo del usuario, por lo que la contraseña podía quedar expuesta en respuestas HTTP, `localStorage` o `AsyncStorage`.

## Corrección aplicada

- La API ahora guarda contraseñas con `crypto.scrypt`, sal aleatoria y comparación con `crypto.timingSafeEqual`.
- El login soporta usuarios antiguos con contraseña en texto plano solo para migrarlos: si la credencial coincide, se reemplaza por un hash inmediatamente.
- Las consultas públicas usan una selección de campos segura y las respuestas de autenticación, perfil, valoraciones y aplicaciones eliminan campos sensibles como `contrase_a`, `contraseña`, `contrasena` y `password`, incluso cuando vienen anidados.
- Web y móvil redactan datos sensibles antes de persistir el usuario en `localStorage` o `AsyncStorage`.
- Los eventos de registro/login agregan trazas de seguridad sin registrar contraseñas ni secretos en claro.

## Pruebas automatizadas

Comando:

```bash
cd hogar-api
npm test
```

Casos cubiertos:

- El hash generado no coincide con el texto plano y sí permite verificar la contraseña correcta.
- Una contraseña incorrecta es rechazada.
- Una contraseña antigua en texto plano se detecta con `needsRehash: true` para migración.
- La redacción elimina secretos en respuestas anidadas.

## Reducción de audit poisoning

Para producción, las trazas de seguridad deberían enviarse a un colector remoto o archivo append-only con rotación controlada. Si se requiere mayor evidencia de integridad, cada línea de log puede incluir un hash encadenado del evento anterior para detectar alteraciones o borrados.
