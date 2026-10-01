import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginApiResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // Asegúrate de incluir /miapi al final de la URL
  private API_URL = 'http://localhost/miapi';

  async login(email: string, password: string): Promise<LoginApiResponse> {
    const res = await axios.post<LoginApiResponse>(`${this.API_URL}/login.php`, { email, password });
    return res.data;
  }

  async registrar(email: string, password: string): Promise<LoginApiResponse> {
    const res = await axios.post<LoginApiResponse>(`${this.API_URL}/registro.php`, { email, password });
    return res.data;
  }
}