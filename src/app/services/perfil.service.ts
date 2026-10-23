// perfil.service.ts
// Capa de acceso a datos para la entidad Perfil.
// Incluye caché local, cola de sincronización sin conexión y subida de foto.

import { Injectable } from '@angular/core';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import { Perfil, PerfilApiResponse, PerfilesApiResponse } from '../models/perfil.model';
import { ConectividadService } from './conectividad.service';
import { SyncService, esErrorDeRed } from './sync.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {

  private API_URL = 'http://localhost/miapi/perfil.php';
  private CACHE_KEY = 'cache_perfiles';

  constructor(
    private conectividad: ConectividadService,
    private sync: SyncService,
    private apiConfig: ApiConfigService
  ) {}

  /** URL base de la API (ej. http://localhost/miapi), sin "/" al final */
  private get baseUrl(): string {
    const base = (this.apiConfig.http as any)?.defaults?.baseURL ?? 'http://localhost/miapi';
    return String(base).replace(/\/+$/, '');
  }

  private normalizar(perfil: Perfil): Perfil {
    return {
      ...perfil,
      languages: Array.isArray(perfil.languages)
        ? perfil.languages.join(',')
        : perfil.languages,
    };
  }

  // ---------- Caché local ----------

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

  // ---------- READ ----------

  /**
   * READ con estrategia de caché:
   * - Si hay internet y la API responde, trae datos frescos y actualiza la caché.
   * - Si no hay internet, o la API falla, regresa la última copia guardada.
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

  /** READ simple (sin caché) */
  async obtenerTodos(): Promise<Perfil[]> {
    const res = await axios.get<PerfilesApiResponse>(this.API_URL);
    return res.data.data ?? [];
  }

  async obtenerPorId(id: number): Promise<Perfil | undefined> {
    const res = await axios.get<PerfilApiResponse>(`${this.API_URL}?id=${id}`);
    return res.data.data;
  }

  // ---------- CREATE / UPDATE / DELETE (en línea) ----------

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

  // ---------- Con sincronización sin conexión ----------

  /** Elimina en línea; si no hay red, deja la operación en la cola para sincronizar después */
  async eliminarConSync(id: number): Promise<void> {
    try {
      await this.apiConfig.http.delete(`perfiles.php?id=${id}`);
    } catch (error) {
      if (!esErrorDeRed(error)) throw error;
      await this.sync.encolar({ tipo: 'eliminar', id });
    }
    // Quita el perfil de la copia local para que desaparezca de la lista
    const cache = (await this.leerCache()).filter((p) => p.id !== id);
    await this.guardarCache(cache);
  }

  /** Actualiza en línea; si no hay red, deja la operación en la cola */
  async actualizarConSync(id: number, datos: Partial<Perfil>): Promise<void> {
    const cuerpo = this.normalizar(datos as Perfil);
    try {
      await this.apiConfig.http.put(`perfiles.php?id=${id}`, cuerpo);
    } catch (error) {
      if (!esErrorDeRed(error)) throw error;
      await this.sync.encolar({ tipo: 'actualizar', id, datos: cuerpo });
    }
    const cache = (await this.leerCache()).map((p) => (p.id === id ? { ...p, ...cuerpo } : p));
    await this.guardarCache(cache);
  }

  // ---------- Foto de perfil ----------

  /** Sube la foto (base64) a subir_foto.php. Devuelve la ruta guardada, ej. "uploads/perfil_1_123.jpg" */
  async subirFoto(id: number, base64: string): Promise<{ success: boolean; photo?: string; message?: string }> {
    const res = await axios.post(`${this.baseUrl}/subir_foto.php`, { id, imagen_base64: base64 });
    return res.data;
  }

  /** Convierte la ruta guardada en la BD en una URL mostrable (o null si no hay foto) */
  urlFoto(photo?: string | null): string | null {
    return photo ? `${this.baseUrl}/${photo}` : null;
  }

  // ---------- Utilidades ----------

  filtrarPorNombre(perfiles: Perfil[], texto: string): Perfil[] {
    const t = texto.toLowerCase().trim();
    return perfiles.filter((p) => p.fullname.toLowerCase().includes(t));
  }
}