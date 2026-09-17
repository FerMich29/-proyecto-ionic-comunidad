import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import anime from 'animejs';
import { UsuarioService } from '../services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  @ViewChild('pathRef') pathRef!: ElementRef<SVGPathElement>;

  email: string = '';
  password: string = '';
  error: string = '';

  private currentAnim: anime.AnimeInstance | null = null;

  // 👇 ya no necesitas la URL aquí, vive dentro de UsuarioService
  constructor(
    private router: Router,
    private usuarioService: UsuarioService   // 👈 nuevo: inyectamos el servicio
  ) {}

  ngOnInit() {}

  animatePath(offset: number, dasharray: string) {
    if (this.currentAnim) this.currentAnim.pause();
    this.currentAnim = anime({
      targets: this.pathRef.nativeElement,
      strokeDashoffset: { value: offset, duration: 700, easing: 'easeOutQuart' },
      strokeDasharray: { value: dasharray, duration: 700, easing: 'easeOutQuart' },
    });
  }

  async handleLogin(e: Event) {
    e.preventDefault();
    this.error = '';
    this.animatePath(-730, '530 1386');

    try {
      // antes: const response = await axios.post(this.API_URL, { email, password });
      const response = await this.usuarioService.login(this.email, this.password);

      if (response.success) {
        this.router.navigateByUrl('/tabs/tab1');
      } else {
        this.error = 'Usuario o contraseña incorrectos';
      }
    } catch (err) {
      console.error(err);
      this.error = 'No se pudo conectar con el servidor';
    }
  }
}