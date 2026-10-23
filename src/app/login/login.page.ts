import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import anime from 'animejs';

import { ApiConfigService } from '../services/api-config.service';
import { UsuarioService } from '../services/usuario.service';
import { ConectividadService } from '../services/conectividad.service';

import {
  IonContent, IonIcon, IonModal, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonButton, IonInput, IonItem
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fingerPrintOutline, personAddOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonModal, IonHeader, IonToolbar,
    IonTitle, IonButtons, IonButton, IonInput, IonItem,
    CommonModule, FormsModule
  ],
})
export class LoginPage implements OnInit {
  @ViewChild('pathRef') pathRef!: ElementRef<SVGPathElement>;
  @ViewChild(IonModal) modal!: IonModal;

  email: string = '';
  password: string = '';
  error: string = '';

  isModalOpen: boolean = false;
  regEmail: string = '';
  regPassword: string = '';
  regError: string = '';

  // Variables para la IP Dinámica
  serverIp: string = '';
  mensajeConexion: string = '';
  conexionExitosa: boolean = false;

  private currentAnim: anime.AnimeInstance | null = null;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private conectividad: ConectividadService,
    private apiConfig: ApiConfigService // Inyectamos el servicio aquí
  ) {
    addIcons({ fingerPrintOutline, personAddOutline, closeOutline });
  }

  ngOnInit() {}

  // Se ejecuta automáticamente al abrir la pantalla
  async ionViewWillEnter() {
    this.serverIp = await this.apiConfig.getHost();
  }

  // Método para el botón "Probar Conexión"
  async probarConexion() {
    this.mensajeConexion = 'Probando conexión...';
    this.conexionExitosa = false;
    
    const exitosa = await this.apiConfig.probarConexion(this.serverIp);
    
    if (exitosa) {
      this.conexionExitosa = true;
      this.mensajeConexion = '¡Conectado a XAMPP!';
      await this.apiConfig.setHost(this.serverIp); // Guardamos la IP
    } else {
      this.mensajeConexion = 'Error: Revisa tu IP o el puerto';
    }
  }

  async setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      try { await this.modal?.dismiss(); } catch (e) {}
      this.regEmail = '';
      this.regPassword = '';
      this.regError = '';
    }
  }

  animatePath(offset: number, dasharray: string) {
    if (this.currentAnim) this.currentAnim.pause();
    this.currentAnim = anime({
      targets: this.pathRef.nativeElement,
      strokeDashoffset: { value: offset, duration: 700, easing: 'easeOutQuart' },
      strokeDasharray: { value: dasharray, duration: 700, easing: 'easeOutQuart' },
    });
  }

  async handleLogin(e: Event) {
    if (e) e.preventDefault();
    this.error = '';

    // Guardamos la IP configurada antes de intentar hacer login
    await this.apiConfig.setHost(this.serverIp);

    const conectado = await this.conectividad.estaConectado();
    if (!conectado) {
      this.error = 'No tienes conexión a internet. Verifica tu red e intenta de nuevo.';
      return;
    }

    this.animatePath(-730, '530 1386');

    try {
      const response = await this.usuarioService.login(this.email, this.password);

      if (response.success) {
        this.router.navigateByUrl('/tabs/tab1');
      } else {
        this.error = 'Usuario o contraseña incorrectos';
      }
    } catch (err) {
      console.error(err);
      this.error = 'No se pudo conectar con el servidor. Revisa tu IP.';
    }
  }

  async handleRegister(e: Event) {
    e.preventDefault();
    this.regError = '';

    // Guardamos la IP configurada antes de registrar
    await this.apiConfig.setHost(this.serverIp);

    const conectado = await this.conectividad.estaConectado();
    if (!conectado) {
      this.regError = 'No tienes conexión a internet. Verifica tu red e intenta de nuevo.';
      return;
    }

    if (!this.regEmail || !this.regPassword) {
      this.regError = 'Por favor, llena ambos campos.';
      return;
    }

    try {
      const response = await this.usuarioService.registrar(this.regEmail, this.regPassword);

      if (response.success) {
        this.email = this.regEmail;
        this.password = this.regPassword;
        this.isModalOpen = false;

        if (this.modal) {
          await this.modal.dismiss();
        }

        await this.handleLogin(new Event('submit'));
      } else {
        this.regError = response.message || 'El correo ya está registrado.';
      }
    } catch (err) {
      console.error(err);
      this.regError = 'No se pudo conectar con el servidor. Revisa tu IP.';
    }
  }
}