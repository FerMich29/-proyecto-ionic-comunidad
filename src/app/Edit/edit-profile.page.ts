import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonItem, IonInput, IonSpinner, AlertController, ActionSheetController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imagesOutline, trashOutline, saveOutline } from 'ionicons/icons';
import anime from 'animejs';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Perfil } from '../models/perfil.model';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonIcon, IonItem, IonInput, IonSpinner,
    CommonModule, FormsModule,
  ],
})
export class EditProfilePage implements OnInit {

  perfilId!: number;
  form: Perfil | null = null;

  // Vista previa de la foto: la nueva que se tomó (si hay) o la que ya estaba guardada
  fotoPreview: string | null = null;
  fotoNuevaBase64: string | null = null;

  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perfilService: PerfilService,
    private alertController: AlertController,
    private actionSheet: ActionSheetController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ cameraOutline, imagesOutline, trashOutline, saveOutline });
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigateByUrl('/tabs/tab1');
      return;
    }
    this.perfilId = Number(idParam);
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      const perfil = await this.perfilService.obtenerPorId(this.perfilId);
      if (!perfil) {
        await this.showAlert('Error', 'No se encontró el perfil');
        this.router.navigateByUrl('/tabs/tab1');
        return;
      }
      this.form = {
        ...perfil,
        languages: typeof perfil.languages === 'string' ? perfil.languages.split(',') : perfil.languages,
      };
      // Si ya tenía foto guardada, la mostramos como vista previa inicial
      this.fotoPreview = this.perfilService.urlFoto(perfil.photo);
    } catch (err) {
      console.error('Error al cargar el perfil', err);
      await this.showAlert('Error', 'No se pudo cargar el perfil');
    }
    this.cdr.detectChanges();   // refresca la pantalla (la app no usa zone.js)
  }

  /** Muestra un menú para elegir el origen de la foto: cámara o galería */
  async elegirOrigen() {
    const sheet = await this.actionSheet.create({
      header: 'Foto de perfil',
      buttons: [
        { text: 'Tomar foto', icon: 'camera-outline', handler: () => { this.capturar(CameraSource.Camera); } },
        { text: 'Elegir de la galería', icon: 'images-outline', handler: () => { this.capturar(CameraSource.Photos); } },
        ...(this.fotoPreview
          ? [{ text: 'Quitar foto', icon: 'trash-outline', role: 'destructive', handler: () => { this.quitarFoto(); } }]
          : []),
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  /** Captura la foto con la cámara o galería del dispositivo */
  private async capturar(source: CameraSource) {
    try {
      const foto = await Camera.getPhoto({
        quality: 80,
        width: 800,              // reduce el peso antes de subirla
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source,
      });

      if (foto.base64String) {
        this.fotoNuevaBase64 = foto.base64String;
        this.fotoPreview = `data:image/${foto.format};base64,${foto.base64String}`;
        this.cdr.detectChanges();
        this.animarFoto();
      }
    } catch (err) {
      // El usuario canceló la captura: no es un error real
      console.log('Captura de foto cancelada', err);
    }
  }

  private quitarFoto() {
    this.fotoNuevaBase64 = null;
    this.fotoPreview = null;
    this.cdr.detectChanges();
  }

  /** Animación "pop" de la foto cuando cambia (Anime.js, ya usado en el login) */
  private animarFoto() {
    setTimeout(() => {
      anime({
        targets: '.foto-preview',
        scale: [0.6, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .6)',
      });
    }, 0);
  }

  async guardar() {
    if (!this.form) return;
    this.guardando = true;
    this.cdr.detectChanges();

    try {
      // 1. Guarda los datos del perfil (texto)
      await this.perfilService.actualizar(this.perfilId, this.form);

      // 2. Si se tomó una foto nueva, se sube aparte como archivo
      if (this.fotoNuevaBase64) {
        await this.perfilService.subirFoto(this.perfilId, this.fotoNuevaBase64);
      }

      await this.showAlert('Éxito', 'Perfil actualizado correctamente');
      this.router.navigateByUrl('/tabs/tab1');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Ocurrió un error al guardar los cambios';
      await this.showAlert('Error', msg);
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}