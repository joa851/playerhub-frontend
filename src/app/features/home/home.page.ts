import { Component, computed, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner],
})
export class HomePage {
  private readonly playerService = inject(PlayerService);

  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;
  readonly hasPlayers = computed(() => this.players().length > 0);
}
