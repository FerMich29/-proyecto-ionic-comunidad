import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import axios, { AxiosInstance } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  public http: AxiosInstance;
  private currentHost: string = 'localhost:80'; // Valor por defecto si no hay IP configurada

  constructor() {
    // 1. Creamos la instancia principal de Axios
    this.http = axios.create({
      timeout: 10000 // Si en 10 segundos no responde, marca error
    });

    // 2. Interceptor: Esta es la magia. 
    // Antes de CADA petición que haga tu app, este código pausa un milisegundo, 
    // lee la IP que guardaste, y arma la URL completa automáticamente.
    this.http.interceptors.request.use(async (config) => {
      const host = await this.getHost();
      // Apunta a tu carpeta miapi en XAMPP
      config.baseURL = `http://${host}/miapi/`;
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
  }

  // Guarda la IP que el usuario escriba en el Login
  async setHost(host: string) {
    let cleanHost = host.trim().replace(/^https?:\/\//, ''); // Limpia si escriben http://
    
    // Si escriben solo la IP (ej. 192.168.1.151) le agregamos el puerto 80 de Apache
    if (!cleanHost.includes(':')) {
      cleanHost += ':80';
    }
    
    // Lo guarda en la memoria del celular usando Capacitor
    await Preferences.set({
      key: 'api_host',
      value: cleanHost
    });
    this.currentHost = cleanHost;
  }

  // Recupera la IP guardada
  async getHost(): Promise<string> {
    const { value } = await Preferences.get({ key: 'api_host' });
    this.currentHost = value || 'localhost:80';
    return this.currentHost;
  }

  // Esta función nos servirá más adelante en la Fase de la Cámara
  async urlAbsoluta(rutaRelativa: string): Promise<string> {
    const host = await this.getHost();
    return `http://${host}/miapi/${rutaRelativa}`;
  }

  // Función para el botón "Probar conexión" del Login
  async probarConexion(hostAProbar: string): Promise<boolean> {
    try {
       let cleanHost = hostAProbar.trim().replace(/^https?:\/\//, '');
       if (!cleanHost.includes(':')) {
         cleanHost += ':80';
       }
       // Intenta hacer un GET rápido a tu archivo login.php para ver si XAMPP responde
       const response = await axios.get(`http://${cleanHost}/miapi/login.php`, { timeout: 5000 });
       return response.status === 200 || response.status === 405; // 405 es normal si el PHP espera POST en vez de GET
    } catch (error) {
       return false; // No hay conexión
    }
  }
}