// perfil.model.ts
// Refleja exactamente las columnas de la tabla `perfiles` en MySQL.

export interface Perfil {
  id?: number;               // autogenerado por la BD, no se envía al crear
  fullname: string;
  password: string;
  email: string;
  phonenumber: string;
  web: string;
  birthdate: string;         // formato 'YYYY-MM-DD'
  siblings: number;
  earnings: number;
  color: string;             // hex, ej. '#ff0000'
  premium: boolean | number; // la BD usa tinyint(1): 0 o 1
  genre: string;
  studies: string;
  languages: string[] | string; // en la BD se guarda como string separado por comas
}

// Respuesta estándar de la API PHP para operaciones sobre un solo perfil
export interface PerfilApiResponse {
  success: boolean;
  message?: string;
  data?: Perfil;
  id?: number; // devuelto al crear (insert_id)
}

// Respuesta estándar de la API PHP para listados
export interface PerfilesApiResponse {
  success: boolean;
  message?: string;
  data?: Perfil[];
}
