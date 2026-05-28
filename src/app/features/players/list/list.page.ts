import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, logInOutline, personAddOutline, addOutline } from 'ionicons/icons';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-players-list',
  templateUrl: 'list.page.html',
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
  ],
})
export class ListPage implements OnInit {
  private readonly playerService = inject(PlayerService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;
  readonly isAuthenticated = this.auth.isAuthenticated;

  constructor() {
    addIcons({ logOutOutline, logInOutline, personAddOutline, addOutline });
  }

  ngOnInit() {
    this.playerService.list().subscribe();
  }

  // Llamado por ion-searchbar con debounce de 400 ms (config en el HTML).
  // Si el input está vacío re-cargamos sin filtro.
  onSearch(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = (target.value || '').trim();
    this.playerService.list(value ? { name: value } : {}).subscribe();
  }

  async logout() {
    await this.auth.logout();
    // Un usuario puede querer hacer logout y seguir consultando la información como invitado
    // this.router.navigate(['/auth/login']);
  }
}
