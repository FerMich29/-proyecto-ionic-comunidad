// perfil.model.ts
// Refleja exactamente las columnas de la tabla `perfiles` en MySQL.

export interface Perfil {
  fullname: any;
  id?: number;               
  password: string;
  email: string;
  phonenumber: string;
  web: string;
  birthdate: string;         // formato 'YYYY-MM-DD'
  siblings: number;
  earnings: number;
  color: string;            
  premium: boolean | number; 
  genre: string;
  studies: string;
  languages: string[] | string; 
  photo?: string | null;     // nombre del archivo de la foto en el servidor
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
