import { Component, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../services/perfil.service';
import { SyncService } from '../services/sync.service';
import { Perfil } from '../models/perfil.model';

import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonItem, IonLabel, IonAvatar, IonButton, IonIcon, AlertController 
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { createOutline, trashOutline, personCircleOutline, addOutline, cloudOfflineOutline, cloudDoneOutline, syncOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
    IonItem, IonLabel, IonAvatar, IonButton, IonIcon
  ]
})
export class Tab1Page {
  perfiles: Perfil[] = [];
  desdeCache = false;

  constructor(
    private perfilService: PerfilService,
    public sync: SyncService,
    private router: Router,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ createOutline, trashOutline, personCircleOutline, addOutline, cloudOfflineOutline, cloudDoneOutline, syncOutline });

    // Cuando termina una sincronización, recarga la lista automáticamente
    this.sync.syncTerminada.pipe(takeUntilDestroyed()).subscribe(() => this.cargarPerfiles());
  }

  async ionViewWillEnter() {
    await this.cargarPerfiles();
  }

  async cargarPerfiles() {
    try {
      const response = await this.perfilService.obtenerTodosConCache();
      this.perfiles = response.data ?? [];
      this.desdeCache = response.desdeCache;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cargar perfiles', error);
    }
  }

  irAEditar(id: number | undefined) {
    if (id) {
      this.router.navigate(['/edit-profile', id]);
    }
  }

  async eliminarPerfil(id: number | undefined) {
    if (!id) return;

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas eliminar este perfil?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.perfilService.eliminarConSync(id);
            await this.cargarPerfiles();
          }
        }
      ]
    });
    await alert.present();
  }
}