import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonItem, IonAvatar, IonLabel, IonButton, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, star } from 'ionicons/icons';
import { Perfil } from '../tab2/tab2.page';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonCard, IonItem, IonAvatar, IonLabel, IonButton, IonIcon, 
    CommonModule, FormsModule
  ]
})
export class Tab3Page implements OnInit {
  favoritos: Perfil[] = [];

  constructor() {
    addIcons({ trashOutline, star });
  }

  ngOnInit() {
    this.cargarFavoritos();
  }

  ionViewWillEnter() {
    this.cargarFavoritos();
  }

  cargarFavoritos() {
    this.favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
  }

  eliminarFavorito(id: number) {
    this.favoritos = this.favoritos.filter(f => f.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
  }
}