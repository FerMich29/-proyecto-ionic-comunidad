import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import axios from 'axios';

interface Perfil {
  id?: number;
  fullname: string;
  password: string;
  email: string;
  phonenumber: string;
  web: string;
  birthdate: string;
  siblings: number;
  earnings: number;
  color: string;
  premium: boolean | number;
  genre: string;
  studies: string;
  languages: string[] | string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule],
})
export class Tab1Page implements OnInit {

  // 👇 AQUÍ VA LA URL DE TU API
  private API_URL = 'http://localhost/miapi/perfil.php';

  perfiles: any[] = [];
  editingId: number | null = null;
  form: Perfil = this.emptyForm();

  constructor(private alertController: AlertController) {}

  ngOnInit() {
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
      const res = await axios.get(this.API_URL);
      this.perfiles = res.data.data;
    } catch (err) {
      this.showAlert('Error', 'No se pudo cargar la lista de perfiles', 'danger');
    }
  }

  async submitForm() {
    const payload = {
      ...this.form,
      languages: Array.isArray(this.form.languages) ? this.form.languages.join(',') : this.form.languages,
    };

    try {
      if (this.editingId) {
        await axios.put(`${this.API_URL}?id=${this.editingId}`, payload);
        await this.showAlert('Éxito', 'Perfil actualizado correctamente', 'success');
      } else {
        await axios.post(this.API_URL, payload);
        await this.showAlert('Éxito', 'Perfil creado correctamente', 'success');
      }
      this.resetForm();
      this.loadPerfiles();
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
      await axios.patch(`${this.API_URL}?id=${perfil.id}`, {
        premium: perfil.premium == 1 ? 0 : 1,
      });
      await this.showAlert('Éxito', 'Estado premium actualizado', 'success');
      this.loadPerfiles();
    } catch (err) {
      this.showAlert('Error', 'No se pudo actualizar el estado premium', 'danger');
    }
  }

  async deletePerfil(id: number | undefined) {
    if (!id) return;
    try {
      await axios.delete(`${this.API_URL}?id=${id}`);
      await this.showAlert('Éxito', 'Perfil eliminado', 'success');
      this.loadPerfiles();
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