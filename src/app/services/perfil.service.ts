// perfil.service.ts
// Capa de acceso a datos para la entidad Perfil.
// Encapsula las llamadas axios que antes vivían directamente en
// Tab1Page y Tab2Page, para separar la UI de la lógica de datos.

import { Injectable } from '@angular/core';
import axios from 'axios';
import { Perfil, PerfilApiResponse, PerfilesApiResponse } from '../models/perfil.model';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  // Ajusta esta URL según tu entorno (idealmente moverla a environment.ts)
  private API_URL = 'http://localhost/miapi/perfil.php';

  /** Normaliza el payload antes de enviarlo: languages como string separado por comas */
  private normalizar(perfil: Perfil): Perfil {
    return {
      ...perfil,
      languages: Array.isArray(perfil.languages)
        ? perfil.languages.join(',')
        : perfil.languages,
    };
  }

  /** READ - obtiene todos los perfiles */
  async obtenerTodos(): Promise<Perfil[]> {
    const res = await axios.get<PerfilesApiResponse>(this.API_URL);
    return res.data.data ?? [];
  }

  /** READ - obtiene un perfil por id */
  async obtenerPorId(id: number): Promise<Perfil | undefined> {
    const res = await axios.get<PerfilApiResponse>(`${this.API_URL}?id=${id}`);
    return res.data.data;
  }

  /** CREATE */
  async crear(perfil: Perfil): Promise<PerfilApiResponse> {
    const res = await axios.post<PerfilApiResponse>(this.API_URL, this.normalizar(perfil));
    return res.data;
  }

  /** UPDATE completo (PUT) */
  async actualizar(id: number, perfil: Perfil): Promise<PerfilApiResponse> {
    const res = await axios.put<PerfilApiResponse>(`${this.API_URL}?id=${id}`, this.normalizar(perfil));
    return res.data;
  }

  /** UPDATE parcial (PATCH) - ej. para marcar/desmarcar "Destacado" (premium) */
  async actualizarParcial(id: number, cambios: Partial<Perfil>): Promise<PerfilApiResponse> {
    const res = await axios.patch<PerfilApiResponse>(`${this.API_URL}?id=${id}`, cambios);
    return res.data;
  }

  /** DELETE */
  async eliminar(id: number): Promise<PerfilApiResponse> {
    const res = await axios.delete<PerfilApiResponse>(`${this.API_URL}?id=${id}`);
    return res.data;
  }

  /** Búsqueda en el cliente por nombre (usada en Tab2) */
  filtrarPorNombre(perfiles: Perfil[], texto: string): Perfil[] {
    const t = texto.toLowerCase().trim();
    return perfiles.filter((p) => p.fullname.toLowerCase().includes(t));
  }
}
