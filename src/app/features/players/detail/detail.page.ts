import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { PlayerService } from '../../../core/services/player.service';
import { Player } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-detail',
  templateUrl: 'detail.page.html',
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner],
})
export class DetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);

  readonly player = signal<Player | null>(null);
  readonly isLoading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isLoading.set(true);
    this.playerService.getById(id).subscribe({
      next: (p) => {
        this.player.set(p);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
