import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import { Subject } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Perfil } from '../models/perfil.model';

export interface OperacionPendiente {
  tipo: 'actualizar' | 'eliminar';
  id: number;
  datos?: Partial<Perfil>;
  fecha: number;
}

/** true si la petición falló por falta de red (no por un error del servidor) */
export function esErrorDeRed(error: any): boolean {
  return axios.isAxiosError(error) && !error.response;
}

@Injectable({ providedIn: 'root' })
export class SyncService {
  // Estado visible en pantalla (signals: funcionan sin zone.js)
  online = signal(true);
  sincronizando = signal(false);
  pendientes = signal(0);
  ultimaSync = signal('');

  // Avisa a las pantallas que ya pueden recargar su lista
  syncTerminada = new Subject<void>();

  private COLA_KEY = 'cola_pendientes';
  private CACHE_KEY = 'cache_perfiles';
  private iniciado = false;

  constructor(private apiConfig: ApiConfigService) {}

  /** Llamar una sola vez al arrancar la app */
  async iniciar() {
    if (this.iniciado) return;
    this.iniciado = true;

    const estado = await Network.getStatus();
    this.online.set(estado.connected);
    await this.actualizarContador();

    // RECUPERACIÓN: cuando vuelve internet, sincroniza solo
    Network.addListener('networkStatusChange', async (status) => {
      this.online.set(status.connected);
      if (status.connected) {
        await this.sincronizar();
      }
    });

    if (estado.connected) {
      await this.sincronizar();
    }
  }

  // ---------- Cola local de cambios ----------
  private async leerCola(): Promise<OperacionPendiente[]> {
    const { value } = await Preferences.get({ key: this.COLA_KEY });
    return value ? JSON.parse(value) : [];
  }

  private async guardarCola(cola: OperacionPendiente[]) {
    await Preferences.set({ key: this.COLA_KEY, value: JSON.stringify(cola) });
    this.pendientes.set(cola.length);
  }

  private async actualizarContador() {
    this.pendientes.set((await this.leerCola()).length);
  }

  async encolar(op: Omit<OperacionPendiente, 'fecha'>) {
    const cola = await this.leerCola();
    cola.push({ ...op, fecha: Date.now() });
    await this.guardarCola(cola);
  }

  // ---------- SINCRONIZACIÓN ----------
  async sincronizar() {
    if (this.sincronizando() || !this.online()) return;
    this.sincronizando.set(true);

    try {
      const cola = await this.leerCola();
      let restantes: OperacionPendiente[] = [];

      // 1) Sube los cambios hechos sin conexión, en orden
      for (let i = 0; i < cola.length; i++) {
        const op = cola[i];
        try {
          if (op.tipo === 'actualizar') {
            await this.apiConfig.http.put(`perfiles.php?id=${op.id}`, op.datos);
          } else {
            await this.apiConfig.http.delete(`perfiles.php?id=${op.id}`);
          }
        } catch (error) {
          if (esErrorDeRed(error)) {
            // Se cayó el internet a la mitad: conserva lo que falta
            restantes = cola.slice(i);
            break;
          }
          // Error del servidor (404, 500): se descarta para no bloquear la cola
          console.error('Operación descartada por error del servidor', op, error);
        }
      }
      await this.guardarCola(restantes);

      // 2) Si ya no quedan pendientes, baja la versión oficial del servidor
      if (restantes.length === 0) {
        const res = await this.apiConfig.http.get<any>('perfiles.php');
        const lista = res.data.data ?? (Array.isArray(res.data) ? res.data : []);
        await Preferences.set({ key: this.CACHE_KEY, value: JSON.stringify(lista) });
        this.ultimaSync.set(new Date().toLocaleTimeString('es-MX'));
      }
    } catch (error) {
      console.error('Error durante la sincronización', error);
    } finally {
      this.sincronizando.set(false);
      this.syncTerminada.next();
    }
  }
}