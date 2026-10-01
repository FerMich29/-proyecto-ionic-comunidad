// usuario.model.ts
// Refleja exactamente las columnas de la tabla `usuarios` en MySQL.


export interface Usuario {
  id?: number;
  email: string;
  password: string;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
}

