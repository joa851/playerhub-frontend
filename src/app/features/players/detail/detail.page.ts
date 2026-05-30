import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRange,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, trashOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { Player } from '../../../core/models/player.model';
import { BackendToggleComponent } from '../../../shared/components/backend-toggle.component';

@Component({
  selector: 'app-player-detail',
  templateUrl: 'detail.page.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonRange,
    BackendToggleComponent,
  ],
})
export class DetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly player = signal<Player | null>(null);
  readonly isLoading = signal(false);
  readonly isSubmittingComment = signal(false);
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;

  readonly commentForm = this.fb.nonNullable.group({
    author: ['', [Validators.required, Validators.maxLength(200)]],
    text:   ['', [Validators.required, Validators.maxLength(1000)]],
    rating: [3, [Validators.required, Validators.min(0), Validators.max(5)]],
    location: this.fb.nonNullable.group({
      latitude:  [null as number | null],
      longitude: [null as number | null],
    }),
  });

  readonly locationError = signal<string | null>(null);

  constructor() {
    addIcons({ locationOutline, trashOutline });
  }

  /** Rellena lat/lon del comentario con la geolocalización del dispositivo. */
  async useMyLocation() {
    this.locationError.set(null);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      });
      this.commentForm.controls.location.patchValue({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      const msg = (err as Error)?.message ?? 'No se pudo obtener la ubicación';
      this.locationError.set(msg);
    }
  }

  ngOnInit() {
    this.refreshPlayer();
  }

  private async refreshPlayer() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isLoading.set(true);
    try {
      const p = await firstValueFrom(this.playerService.getById(id));
      this.player.set(p);
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitComment() {
    const p = this.player();
    if (this.commentForm.invalid || !p?._id) return;
    this.isSubmittingComment.set(true);
    try {
      const raw = this.commentForm.getRawValue();
      // Construimos el payload sin location si no se ha capturado.
      const payload: Record<string, unknown> = {
        author: raw.author,
        text:   raw.text,
        rating: raw.rating,
      };
      if (raw.location.latitude != null && raw.location.longitude != null) {
        payload['location'] = raw.location;
      }

      await firstValueFrom(this.playerService.addComment(p._id, payload as never));
      this.commentForm.reset({
        author: '',
        text:   '',
        rating: 3,
        location: { latitude: null, longitude: null },
      });
      this.locationError.set(null);
      await this.refreshPlayer();
    } finally {
      this.isSubmittingComment.set(false);
    }
  }

  async deleteComment(commentId: string | undefined) {
    const p = this.player();
    if (!p?._id || !commentId) return;
    await firstValueFrom(this.playerService.deleteComment(p._id, commentId));
    await this.refreshPlayer();
  }
}
