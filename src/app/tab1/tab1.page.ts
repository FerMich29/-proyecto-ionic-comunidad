import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,  
  IonCardContent, IonButton, IonIcon, IonAvatar, IonItem, IonLabel, IonTextarea,
  AlertController 
} from '@ionic/angular';
import { PublicacionesService, Publicacion } from '../services/publicaciones.service';
import { addIcons } from 'ionicons';
import { send, saveOutline, closeOutline, createOutline, trashOutline, heartOutline, chatbubbleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard,  
    IonCardContent, IonButton, IonIcon, IonAvatar, IonItem, IonLabel, IonTextarea,
    CommonModule, FormsModule
  ],
})
export class Tab1Page implements OnInit {

  nuevaPublicacion: string = '';
  publicaciones: Publicacion[] = [];
  editingId: number | null = null;
  usuarioActual: { id: number; email: string } | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private publicacionesService: PublicacionesService,
    private alertController: AlertController
  ) {
    addIcons({ send, saveOutline, closeOutline, createOutline, trashOutline, heartOutline, chatbubbleOutline });
  }

  ngOnInit() {
    this.obtenerUsuarioSesion();
    this.cargarFeed();
  }

  ionViewWillEnter() {
    this.obtenerUsuarioSesion();
    this.cargarFeed();
  }

  obtenerUsuarioSesion() {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      this.usuarioActual = JSON.parse(sesion);
    }
  }

  async cargarFeed() {
    if (!this.usuarioActual) return;

    try {
      const response = await this.publicacionesService.obtenerPublicaciones(this.usuarioActual.id);
      if (response && response.success) {
        this.publicaciones = response.data;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    }
  }

  async guardar() {
    if (!this.nuevaPublicacion.trim() || !this.usuarioActual) return;

    if (this.editingId) {
      const response = await this.publicacionesService.actualizarPublicacion(this.editingId, this.nuevaPublicacion);
      if (response && response.success) {
        this.resetForm();
        await this.cargarFeed();
      }
    } else {
      const response = await this.publicacionesService.crearPublicacion({
        usuario_id: this.usuarioActual.id,
        autor: this.usuarioActual.email,
        avatar: `https://i.pravatar.cc/150?u=${this.usuarioActual.id}`,
        contenido: this.nuevaPublicacion
      });

      if (response && response.success) {
        this.resetForm();
        await this.cargarFeed();
      }
    }
  }

  editar(post: Publicacion) {
    this.editingId = post.id;
    this.nuevaPublicacion = post.contenido;
  }

  resetForm() {
    this.editingId = null;
    this.nuevaPublicacion = '';
  }

  async eliminar(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar esta publicación?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const response = await this.publicacionesService.eliminarPublicacion(id);
            if (response && response.success) {
              await this.cargarFeed();
            }
          }
        }
      ]
    });
    await alert.present();
  }
}