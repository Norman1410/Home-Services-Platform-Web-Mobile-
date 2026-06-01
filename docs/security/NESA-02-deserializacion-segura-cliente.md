# NESA-02 - Deserializacion segura de sesion en el cliente web

## Vulnerabilidad
La aplicacion web utilizaba `JSON.parse(localStorage.getItem('usuario'))` directamente
durante el inicio y al evaluar una ruta protegida. Un valor de sesion corrupto o
manipulado en el almacenamiento del navegador producia una excepcion sin manejar y
dejaba inutilizable la interfaz.

## Correccion
Se agrego `getStoredUser()` para deserializar el valor persistido dentro de un bloque
controlado, validar que exista un identificador y un rol esperado, y eliminar el dato
invalido. `App` y `RutaProtegida` ahora utilizan este lector seguro; ante datos
malformados el usuario vuelve a la pantalla de inicio de sesion.

Esta validacion protege la estabilidad del cliente, pero no reemplaza la autorizacion
en el servidor para acciones sensibles.

## Prueba
Las pruebas almacenan una cadena JSON incompleta y una sesion con un rol inesperado en
`localStorage`. La aplicacion debe rechazar esos datos sin lanzar excepciones y debe
mostrar el inicio de sesion en lugar de bloquearse.
