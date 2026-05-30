import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparklesOutline, refreshOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PlayerService } from '../../../core/services/player.service';
import { Player } from '../../../core/models/player.model';
import { BackendToggleComponent } from '../../../shared/components/backend-toggle.component';

@Component({
  selector: 'app-ideal-team',
  templateUrl: 'ideal-team.page.html',
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    BackendToggleComponent,
  ],
})
export class IdealTeamPage {
  private readonly playerService = inject(PlayerService);

  readonly players = signal<Player[]>([]);
  readonly isGenerating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  /** True una vez se ha pulsado "Generar"; sirve para distinguir el
   *  estado inicial (sin pedir nada) del "no hay resultados". */
  readonly hasGenerated = signal(false);

  constructor() {
    addIcons({ sparklesOutline, refreshOutline });
  }

  async generate() {
    this.isGenerating.set(true);
    this.errorMessage.set(null);
    try {
      const team = await firstValueFrom(this.playerService.idealTeam());
      this.players.set(team);
      this.hasGenerated.set(true);
    } catch (err) {
      this.players.set([]);
      this.hasGenerated.set(true);
      this.errorMessage.set(this.translateError(err));
    } finally {
      this.isGenerating.set(false);
    }
  }

  private translateError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 503) return 'El servicio LLM no está configurado en el backend.';
      if (err.status === 502) return 'Gemini no está disponible ahora mismo. Inténtalo más tarde.';
      if (err.status === 0)   return 'No se pudo contactar con el backend.';
      return `Error ${err.status} al generar el equipo.`;
    }
    return 'Error inesperado al generar el equipo.';
  }
}
