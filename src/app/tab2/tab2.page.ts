import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonCard, IonItem, IonAvatar, IonLabel, IonButton, IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star, starOutline, personOutline } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { ConectividadService } from '../services/conectividad.service';

export interface Perfil {
  id: number;
  email: string;
  avatar: string;
  esFavorito?: boolean;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonCard, IonItem, IonAvatar, IonLabel, IonButton, IonIcon,
    CommonModule, FormsModule
  ]
})
export class Tab2Page implements OnInit {

  private CACHE_KEY = 'tab2_perfiles_cache';

  perfiles: Perfil[] = [];
  busqueda: string = '';
  mensajeConexion: string = ''; // 👈 nuevo: aviso visible al usuario

  constructor(
    private cdr: ChangeDetectorRef,
    private conectividad: ConectividadService // 👈 nuevo
  ) {
    addIcons({ star, starOutline, personOutline });
  }

  ngOnInit() {
    this.cargarPerfiles();
  }

  ionViewWillEnter() {
    this.cargarPerfiles();
  }

  private aplicarFavoritos(lista: Perfil[]): Perfil[] {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    return lista.map((p) => ({
      ...p,
      esFavorito: favs.some((f: Perfil) => f.id === p.id),
    }));
  }

  private async guardarCache(perfiles: Perfil[]) {
    await Preferences.set({
      key: this.CACHE_KEY,
      value: JSON.stringify(perfiles),
    });
  }

  private async leerCache(): Promise<Perfil[]> {
    const { value } = await Preferences.get({ key: this.CACHE_KEY });
    return value ? JSON.parse(value) : [];
  }

  async cargarPerfiles() {
    this.mensajeConexion = '';

    // 1. Verifica conexión ANTES de intentar el fetch
    const conectado = await this.conectividad.estaConectado();
    if (!conectado) {
      const cache = await this.leerCache();
      this.perfiles = this.aplicarFavoritos(cache);
      this.mensajeConexion = '📡 Sin conexión a internet. Mostrando la última información guardada en este dispositivo.';
      this.cdr.detectChanges();
      return;
    }

    // 2. Si hay conexión, intenta traer datos frescos
    try {
      const url = `http://localhost/miapi/perfiles.php?search=${encodeURIComponent(this.busqueda.trim())}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`El servidor respondió con estado ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        this.perfiles = this.aplicarFavoritos(data.data);
        await this.guardarCache(data.data); // 👈 guarda copia de respaldo
      } else {
        throw new Error(data.message || 'La API respondió con un error');
      }
    } catch (e) {
      console.error('Error al obtener perfiles:', e);
      // 3. Si falla (servidor caído, timeout, etc.), recurre a la caché
      const cache = await this.leerCache();
      this.perfiles = this.aplicarFavoritos(cache);
      this.mensajeConexion = '⚠️ No se pudo conectar con el servidor. Mostrando la última información guardada.';
    }

    this.cdr.detectChanges();
  }

  toggleFavorito(perfil: Perfil) {
    let favs: Perfil[] = JSON.parse(localStorage.getItem('favoritos') || '[]');

    if (perfil.esFavorito) {
      favs = favs.filter(f => f.id !== perfil.id);
      perfil.esFavorito = false;
    } else {
      favs.push(perfil);
      perfil.esFavorito = true;
    }

    localStorage.setItem('favoritos', JSON.stringify(favs));
    this.cdr.detectChanges();
  }
}