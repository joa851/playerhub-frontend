import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, locationOutline, trashOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from '../../../core/services/player.service';

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
    IonList,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
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

  constructor() {
    addIcons({ cameraOutline, locationOutline, trashOutline });
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
      if (created?._id) {
        this.router.navigate(['/players', created._id]);
      } else {
        this.router.navigate(['/players']);
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
