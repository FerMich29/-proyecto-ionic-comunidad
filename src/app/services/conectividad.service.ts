import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class ConectividadService {

  /** Pregunta en el momento si hay conexión a internet */
  async estaConectado(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }
}