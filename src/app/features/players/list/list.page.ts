import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-players-list',
  templateUrl: 'list.page.html',
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
  ],
})
export class ListPage implements OnInit {
  private readonly playerService = inject(PlayerService);

  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;

  ngOnInit() {
    this.playerService.list().subscribe();
  }
}
