import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, FormsModule],
})
export class Tab2Page implements OnInit {

  todos: any[] = [];
  filtrados: any[] = [];
  busqueda: string = '';

  constructor(private perfilService: PerfilService) {}  // 👈 nuevo

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      // antes: const res = await axios.get(this.API_URL); this.todos = res.data.data;
      this.todos = await this.perfilService.obtenerTodos();
      this.filtrados = this.todos;
    } catch (err) {
      console.error(err);
    }
  }

  buscar() {
    // antes: filtro manual con .filter() aquí mismo
    this.filtrados = this.perfilService.filtrarPorNombre(this.todos, this.busqueda);
  }
}