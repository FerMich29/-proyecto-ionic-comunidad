import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

interface Favorito {
  id: number;
  nombre: string;
  nota: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule],
})
export class Tab3Page implements OnInit {

  private STORAGE_KEY = 'favoritos';

  favoritos: Favorito[] = [];
  editingId: number | null = null;
  form: Favorito = { id: 0, nombre: '', nota: '' };

  constructor(
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarFavoritos();
  }

  ionViewWillEnter() {
    this.cargarFavoritos();
  }

  async cargarFavoritos() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    this.favoritos = value ? JSON.parse(value) : [];
    this.cdr.detectChanges();
  }

  private async guardarEnDispositivo() {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(this.favoritos),
    });
  }

  async guardar() {
    if (!this.form.nombre.trim()) {
      this.showAlert('Error', 'El nombre es obligatorio', 'danger');
      return;
    }

    if (this.editingId) {
      const index = this.favoritos.findIndex((f) => f.id === this.editingId);
      if (index !== -1) {
        this.favoritos[index] = { ...this.form, id: this.editingId };
      }
      await this.showAlert('Éxito', 'Favorito actualizado', 'success');
    } else {
      const nuevo: Favorito = {
        id: Date.now(),
        nombre: this.form.nombre,
        nota: this.form.nota,
      };
      this.favoritos.push(nuevo);
      await this.showAlert('Éxito', 'Favorito agregado', 'success');
    }

    await this.guardarEnDispositivo();
    this.resetForm();
    this.cdr.detectChanges();
  }

  editar(fav: Favorito) {
    this.editingId = fav.id;
    this.form = { ...fav };
  }

  async eliminar(id: number) {
    this.favoritos = this.favoritos.filter((f) => f.id !== id);
    await this.guardarEnDispositivo();
    await this.showAlert('Éxito', 'Favorito eliminado', 'success');
    this.cdr.detectChanges();
  }

  resetForm() {
    this.editingId = null;
    this.form = { id: 0, nombre: '', nota: '' };
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