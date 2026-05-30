import { Component, inject, signal } from '@angular/core';
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
import { BackendToggleComponent } from '../../../shared/components/backend-toggle.component';

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
    BackendToggleComponent,
  ],
})
export class ListPage {
  private readonly playerService = inject(PlayerService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;
  readonly isAuthenticated = this.auth.isAuthenticated;

  /** Valor del searchbar. Permite resetearlo programáticamente. */
  readonly searchTerm = signal('');

  constructor() {
    addIcons({ logOutOutline, logInOutline, personAddOutline, addOutline });
  }

  /**
   * Se dispara cada vez que la página se hace visible (primera carga
   * y también al volver desde /players/new o /players/:id). Así, si el
   * usuario acaba de crear/importar un jugador, lo verá en el listado
   * sin tener que recargar manualmente.
   *
   * Aprovechamos para limpiar el filtro y partir siempre del estado base.
   */
  ionViewWillEnter() {
    this.searchTerm.set('');
    this.playerService.list().subscribe();
  }

  onSearch(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = (target.value || '').trim();
    this.searchTerm.set(value);
    this.playerService.list(value ? { name: value } : {}).subscribe();
  }

  async logout() {
    await this.auth.logout();
    // No navegamos: el usuario puede seguir como invitado.
    // Pero sí limpiamos el filtro porque "estamos volviendo" al estado base.
    this.searchTerm.set('');
    this.playerService.list().subscribe();
  }
}
