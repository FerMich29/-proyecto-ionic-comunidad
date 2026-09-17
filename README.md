# Directorio de la Comunidad

Aplicación móvil desarrollada en **Ionic + Angular** que permite a un grupo de personas registrarse mediante un inicio de sesión y crear un perfil público dentro de un directorio compartido, consultable y editable por el resto de la comunidad.

## Objetivo

Demostrar el manejo de un flujo completo de autenticación y de un CRUD (Crear, Leer, Actualizar y Eliminar) consumido desde una aplicación móvil híbrida mediante peticiones HTTP con **Axios**, conectado a una **API propia en PHP** con base de datos **MySQL**.

## Vistas

- **Login**: inicio de sesión con validación contra la API.
- **Directorio / Mi perfil (Tab1)**: alta, edición, activar/quitar destacado y eliminación de perfiles.
- **Buscar en el Directorio (Tab2)**: búsqueda de miembros por nombre.

## Tecnologías

- Ionic 8 + Angular (standalone components)
- Axios
- Anime.js (animación del login)
- PHP + MySQLi (API REST: GET, POST, PUT, PATCH, DELETE, OPTIONS)
- XAMPP (Apache + MySQL)

## Cómo correrlo

1. `npm install`
2. Levantar Apache y MySQL en XAMPP.
3. Crear la base de datos `proyecto_login` y las tablas `usuarios` y `perfiles` (ver script SQL en `/api`).
4. Colocar `login.php` y `perfil.php` en `htdocs/miapi/`.
5. `ionic serve`