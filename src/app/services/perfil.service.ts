// perfil.service.ts
// Capa de acceso a datos para la entidad Perfil.
// Incluye estrategia de caché local para tolerar fallos de red/servidor.

import { Injectable } from '@angular/core';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { Perfil, PerfilApiResponse, PerfilesApiResponse } from '../models/perfil.model';
import { ConectividadService } from './conectividad.service';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {

  private API_URL = 'http://localhost/miapi/perfil.php';
  private CACHE_KEY = 'cache_perfiles';

  constructor(private conectividad: ConectividadService) {}

  private normalizar(perfil: Perfil): Perfil {
    return {
      ...perfil,
      languages: Array.isArray(perfil.languages)
        ? perfil.languages.join(',')
        : perfil.languages,
    };
  }

  /** Guarda una copia local de la última lista obtenida con éxito */
  private async guardarCache(perfiles: Perfil[]) {
    await Preferences.set({
      key: this.CACHE_KEY,
      value: JSON.stringify(perfiles),
    });
  }

  /** Lee la copia local guardada (puede estar vacía si nunca hubo conexión) */
  private async leerCache(): Promise<Perfil[]> {
    const { value } = await Preferences.get({ key: this.CACHE_KEY });
    return value ? JSON.parse(value) : [];
  }

  /**
   * READ con estrategia de caché:
   * - Si hay internet y la API responde, trae datos frescos y actualiza la caché.
   * - Si no hay internet, o la API falla, regresa la última copia guardada.
   * El indicador `desdeCache` le dice a la pantalla si debe avisarle al usuario.
   */
  async obtenerTodosConCache(): Promise<{ data: Perfil[]; desdeCache: boolean }> {
    const conectado = await this.conectividad.estaConectado();

    if (!conectado) {
      return { data: await this.leerCache(), desdeCache: true };
    }

    try {
      const res = await axios.get<PerfilesApiResponse>(this.API_URL);
      const data = res.data.data ?? [];
      await this.guardarCache(data);
      return { data, desdeCache: false };
    } catch (err) {
      return { data: await this.leerCache(), desdeCache: true };
    }
  }

  /** READ simple (sin caché) - se mantiene por si otra parte del código la usa */
  async obtenerTodos(): Promise<Perfil[]> {
    const res = await axios.get<PerfilesApiResponse>(this.API_URL);
    return res.data.data ?? [];
  }

  async obtenerPorId(id: number): Promise<Perfil | undefined> {
    const res = await axios.get<PerfilApiResponse>(`${this.API_URL}?id=${id}`);
    return res.data.data;
  }

  async crear(perfil: Perfil): Promise<PerfilApiResponse> {
    const res = await axios.post<PerfilApiResponse>(this.API_URL, this.normalizar(perfil));
    return res.data;
  }

  async actualizar(id: number, perfil: Perfil): Promise<PerfilApiResponse> {
    const res = await axios.put<PerfilApiResponse>(`${this.API_URL}?id=${id}`, this.normalizar(perfil));
    return res.data;
  }

  async actualizarParcial(id: number, cambios: Partial<Perfil>): Promise<PerfilApiResponse> {
    const res = await axios.patch<PerfilApiResponse>(`${this.API_URL}?id=${id}`, cambios);
    return res.data;
  }

  async eliminar(id: number): Promise<PerfilApiResponse> {
    const res = await axios.delete<PerfilApiResponse>(`${this.API_URL}?id=${id}`);
    return res.data;
  }

  filtrarPorNombre(perfiles: Perfil[], texto: string): Perfil[] {
    const t = texto.toLowerCase().trim();
    return perfiles.filter((p) => p.fullname.toLowerCase().includes(t));
  }
}