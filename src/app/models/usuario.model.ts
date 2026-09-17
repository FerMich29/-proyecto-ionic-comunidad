// usuario.model.ts
// Refleja exactamente las columnas de la tabla `usuarios` en MySQL.
// Nota: esta tabla es independiente de `perfiles` (no hay FK entre ellas
// en la base de datos actual). Se usa únicamente para el login.

export interface Usuario {
  id?: number;
  email: string;
  password: string;
}

// login.php solo regresa success + message, sin datos del usuario ni token
export interface LoginApiResponse {
  success: boolean;
  message: string;
}
