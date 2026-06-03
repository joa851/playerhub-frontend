import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController,
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
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  logInOutline,
  personAddOutline,
  addOutline,
  trashOutline,
  sparklesOutline,
  createOutline,
} from 'ionicons/icons';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { Player } from '../../../core/models/player.model';
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
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;

  /** Valor del searchbar. Permite resetearlo programáticamente. */
  readonly searchTerm = signal('');

  constructor() {
    addIcons({ logOutOutline, logInOutline, personAddOutline, addOutline, trashOutline, sparklesOutline, createOutline });
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

  /**
   * Borrado de jugador desde la lista. Solo visible para admin (la UI
   * lo oculta con *ngIf="isAdmin()") y solo permitido por backend
   * (requireAdmin sobre DELETE /players/:id).
   *
   * Pide confirmación antes para evitar borrados accidentales. Tras
   * borrar recarga el listado para no dejar el item fantasma.
   *
   * El event.stopPropagation() es necesario porque el ion-item entero
   * tiene routerLink: sin él, click en la papelera navegaría al detalle.
   */
  async deletePlayer(player: Player, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const alert = await this.alertCtrl.create({
      header: 'Borrar jugador',
      message: `¿Eliminar a ${player.name}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: () => {
            if (!player._id) return;
            this.playerService.delete(player._id).subscribe({
              next: async () => {
                this.playerService.list(this.searchTerm() ? { name: this.searchTerm() } : {}).subscribe();
                const toast = await this.toastCtrl.create({
                  message: `"${player.name}" eliminado.`,
                  duration: 2000,
                  color: 'success',
                });
                await toast.present();
              },
              error: async (err) => {
                const toast = await this.toastCtrl.create({
                  message: err?.status === 403
                    ? 'No tienes permiso para borrar.'
                    : 'Error al borrar el jugador.',
                  duration: 2500,
                  color: 'danger',
                });
                await toast.present();
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
