// usuario.service.ts
// Capa de acceso a datos para la entidad Usuario (login).

import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginApiResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private API_URL = 'http://localhost/miapi/login.php';

  /** Verifica credenciales contra la tabla `usuarios` */
  async login(email: string, password: string): Promise<LoginApiResponse> {
    const res = await axios.post<LoginApiResponse>(this.API_URL, { email, password });
    return res.data;
  }
}
