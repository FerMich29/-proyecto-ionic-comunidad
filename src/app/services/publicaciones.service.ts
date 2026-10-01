import { Injectable } from '@angular/core';

export interface Publicacion {
  id: number;
  usuario_id: number;
  autor: string;
  avatar: string;
  contenido: string;
  likes?: number;
  fecha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private apiUrl = 'http://localhost/miapi/publicaciones.php'; // Ajusta la ruta si usas subcarpeta

  async obtenerPublicaciones(usuarioId?: number): Promise<any> {
    const url = usuarioId ? `${this.apiUrl}?usuario_id=${usuarioId}` : this.apiUrl;
    const response = await fetch(url);
    return await response.json();
  }

  async crearPublicacion(datos: { usuario_id: number; autor: string; avatar: string; contenido: string }): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return await response.json();
  }

  async actualizarPublicacion(id: number, contenido: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido })
    });
    return await response.json();
  }

  async eliminarPublicacion(id: number): Promise<any> {
    const response = await fetch(`${this.apiUrl}?id=${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  }
}