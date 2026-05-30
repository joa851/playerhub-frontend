import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, cloudDownloadOutline, locationOutline, trashOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '../../../core/services/player.service';
import { BackendToggleComponent } from '../../../shared/components/backend-toggle.component';

/** Shape de cada item devuelto por GET /players/external. */
interface ExternalPlayer {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  nationality?: string;
  position?: string;
  photo?: string;
}

@Component({
  selector: 'app-player-create',
  templateUrl: 'create.page.html',
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
    IonFooter,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
    IonCheckbox,
    BackendToggleComponent,
  ],
})
export class CreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly playerService = inject(PlayerService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name:        ['', [Validators.required, Validators.maxLength(200)]],
    firstname:   [''],
    lastname:    [''],
    age:         [null as number | null],
    nationality: [''],
    height:      [''],
    weight:      [''],
    number:      [null as number | null],
    position:    [''],
    team:        [''],
    league:      [''],
    photo:       [''],
    location: this.fb.nonNullable.group({
      latitude:  [null as number | null],
      longitude: [null as number | null],
    }),
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly photoPreview = signal<string | null>(null);

  // ─── Tab API-Football ──────────────────────────────────────────────
  readonly activeTab = signal<'form' | 'external'>('form');
  readonly externalQuery = signal('');
  readonly externalResults = signal<ExternalPlayer[]>([]);
  readonly externalSearching = signal(false);
  readonly externalError = signal<string | null>(null);
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly importing = signal(false);

  constructor() {
    addIcons({ cameraOutline, cloudDownloadOutline, locationOutline, trashOutline });
  }

  // ─── Tab switching ─────────────────────────────────────────────────

  onTabChange(event: Event) {
    const value = (event as CustomEvent).detail.value as 'form' | 'external';
    this.activeTab.set(value);
  }

  // ─── Búsqueda externa ──────────────────────────────────────────────

  async onExternalSearch(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const value = (target.value || '').trim();
    this.externalQuery.set(value);
    if (!value) {
      this.externalResults.set([]);
      return;
    }
    this.externalSearching.set(true);
    this.externalError.set(null);
    try {
      const results = await firstValueFrom(
        this.playerService.searchExternal(value),
      ) as ExternalPlayer[];
      this.externalResults.set(results);
    } catch (err) {
      const msg = (err as { error?: { error?: string } })?.error?.error
                ?? 'Error buscando en API-Football';
      this.externalError.set(msg);
      this.externalResults.set([]);
    } finally {
      this.externalSearching.set(false);
    }
  }

  toggleSelected(id: number) {
    const next = new Set(this.selectedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedIds.set(next);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  async importSelected() {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    this.importing.set(true);
    this.externalError.set(null);
    try {
      await firstValueFrom(this.playerService.importExternal(ids));
      this.router.navigate(['/players'], { replaceUrl: true });
    } catch (err) {
      const msg = (err as { error?: { error?: string } })?.error?.error
                ?? 'No se pudo importar';
      this.externalError.set(msg);
    } finally {
      this.importing.set(false);
    }
  }

  /** Abre cámara / picker de fotos y guarda como data URL (base64). */
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      const url = image.dataUrl ?? '';
      this.form.patchValue({ photo: url });
      this.photoPreview.set(url);
    } catch {
      // Usuario canceló o no hay permiso. No es error real.
    }
  }

  clearPhoto() {
    this.form.patchValue({ photo: '' });
    this.photoPreview.set(null);
  }

  /** Pide al dispositivo la posición actual. */
  async useMyLocation() {
    this.errorMessage.set(null);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      });
      this.form.controls.location.patchValue({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      const msg = (err as Error)?.message ?? 'No se pudo obtener la ubicación';
      this.errorMessage.set(msg);
    }
  }

  async submit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Limpiamos campos vacíos para no mandarlos al backend.
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v === null || v === '' || (typeof v === 'object' && !this.hasLocationData(v))) {
        continue;
      }
      payload[k] = v;
    }

    try {
      const created = await firstValueFrom(this.playerService.create(payload));
      // botón back del detalle vuelve al listado después de crear.
      if (created?._id) {
        this.router.navigate(['/players', created._id], { replaceUrl: true });
      } else {
        this.router.navigate(['/players'], { replaceUrl: true });
      }
    } catch (err) {
      const msg = (err as { error?: { error?: string } })?.error?.error
                ?? 'No se pudo crear el jugador';
      this.errorMessage.set(msg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Devuelve true si latitude y longitude están informadas. */
  private hasLocationData(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') return false;
    const loc = obj as { latitude?: number | null; longitude?: number | null };
    return loc.latitude != null && loc.longitude != null;
  }
}
