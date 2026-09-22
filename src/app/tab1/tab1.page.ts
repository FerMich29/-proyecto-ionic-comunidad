import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Perfil } from '../models/perfil.model';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule],
})
export class Tab1Page implements OnInit {

  private CACHE_KEY = 'perfiles_cache'; // 👈 nueva "cajita" de respaldo local

  perfiles: any[] = [];
  editingId: number | null = null;
  form: Perfil = this.emptyForm();

  constructor(
    private alertController: AlertController,
    private perfilService: PerfilService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    await this.loadPerfiles();
  }

  ionViewWillEnter() {
    this.loadPerfiles();
  }

  emptyForm(): Perfil {
    return {
      fullname: '',
      password: '',
      email: '',
      phonenumber: '',
      web: 'http://',
      birthdate: '',
      siblings: 1,
      earnings: 1000,
      color: '#ff0000',
      premium: false,
      genre: 'mujer',
      studies: '',
      languages: [],
    };
  }

  async loadPerfiles() {
    try {
      // 1. Intenta traer los datos frescos de la API
      this.perfiles = await this.perfilService.obtenerTodos();

      // 2. Si funcionó, guarda una copia local de respaldo
      await Preferences.set({
        key: this.CACHE_KEY,
        value: JSON.stringify(this.perfiles),
      });
    } catch (err) {
      // 3. Si la API falló (ej. XAMPP apagado), intenta usar la copia guardada
      const { value } = await Preferences.get({ key: this.CACHE_KEY });
      if (value) {
        this.perfiles = JSON.parse(value);
        this.showAlert(
          'Sin conexión',
          'No se pudo conectar al servidor. Mostrando la última información guardada en este dispositivo.',
          'danger'
        );
      } else {
        this.showAlert('Error', 'No se pudo cargar la lista de perfiles', 'danger');
      }
    }
    this.cdr.detectChanges();
  }

  async submitForm() {
    try {
      if (this.editingId) {
        await this.perfilService.actualizar(this.editingId, this.form);
        await this.showAlert('Éxito', 'Perfil actualizado correctamente', 'success');
      } else {
        await this.perfilService.crear(this.form);
        await this.showAlert('Éxito', 'Perfil creado correctamente', 'success');
      }
      this.resetForm();
      await this.loadPerfiles();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Ocurrió un error al guardar el perfil';
      this.showAlert('Error', msg, 'danger');
    }
  }

  editPerfil(perfil: any) {
    this.editingId = perfil.id ?? null;
    this.form = {
      ...perfil,
      languages: typeof perfil.languages === 'string' ? perfil.languages.split(',') : perfil.languages,
    };
  }

  async togglePremium(perfil: any) {
    try {
      await this.perfilService.actualizarParcial(perfil.id, {
        premium: perfil.premium == 1 ? 0 : 1,
      });
      await this.showAlert('Éxito', 'Estado premium actualizado', 'success');
      await this.loadPerfiles();
    } catch (err) {
      this.showAlert('Error', 'No se pudo actualizar el estado premium', 'danger');
    }
  }

  async deletePerfil(id: number | undefined) {
    if (!id) return;
    try {
      await this.perfilService.eliminar(id);
      await this.showAlert('Éxito', 'Perfil eliminado', 'success');
      await this.loadPerfiles();
    } catch (err) {
      this.showAlert('Error', 'No se pudo eliminar el perfil', 'danger');
    }
  }

  resetForm() {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  async showAlert(header: string, message: string, tipo: 'success' | 'danger') {
    const alert = await this.alertController.create({
      header,
      message,
      cssClass: tipo === 'success' ? 'alert-success' : 'alert-danger',
      buttons: ['OK'],
    });
    await alert.present();
  }
}