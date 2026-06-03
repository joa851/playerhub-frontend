import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { BackendToggleComponent } from '../../../shared/components/backend-toggle.component';

/**
 * Pantalla de edición de jugador. Reusa la misma estructura del formulario
 * de creación pero se carga con los datos actuales y llama a update().
 *
 * Solo accesible por admins (la ruta tiene authGuard; el botón "Editar"
 * en el detalle se oculta para usuarios no admin; el backend rechaza con
 * 403 si llega por otra vía).
 */
@Component({
  selector: 'app-player-edit',
  templateUrl: 'edit.page.html',
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
    BackendToggleComponent,
  ],
})
export class EditPage {
  private readonly fb = inject(FormBuilder);
  private readonly playerService = inject(PlayerService);
  private readonly route = inject(ActivatedRoute);
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

  readonly isLoading    = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly photoPreview = signal<string | null>(null);
  readonly playerId     = signal<string | null>(null);

  constructor() {
    addIcons({ cameraOutline, locationOutline, trashOutline });
  }

  /** ionViewWillEnter dispara cada vez que la página se muestra. */
  async ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/players'], { replaceUrl: true });
      return;
    }
    this.playerId.set(id);
    this.isLoading.set(true);
    try {
      const player = await firstValueFrom(this.playerService.getById(id));
      // Pre-rellenamos el formulario con los datos del jugador.
      this.form.patchValue({
        name:        player.name ?? '',
        firstname:   player.firstname ?? '',
        lastname:    player.lastname ?? '',
        age:         player.age ?? null,
        nationality: player.nationality ?? '',
        height:      player.height ?? '',
        weight:      player.weight ?? '',
        number:      player.number ?? null,
        position:    player.position ?? '',
        team:        player.team ?? '',
        league:      player.league ?? '',
        photo:       player.photo ?? '',
        location: {
          latitude:  player.location?.latitude ?? null,
          longitude: player.location?.longitude ?? null,
        },
      });
      if (player.photo) this.photoPreview.set(player.photo);
    } catch {
      this.errorMessage.set('No se pudo cargar el jugador.');
    } finally {
      this.isLoading.set(false);
    }
  }

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
      // Cancelado por el usuario.
    }
  }

  clearPhoto() {
    this.form.patchValue({ photo: '' });
    this.photoPreview.set(null);
  }

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
    const id = this.playerId();
    if (this.form.invalid || !id) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Construimos el payload solo con campos que tienen valor.
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v === null || v === '' || (typeof v === 'object' && !this.hasLocationData(v))) {
        continue;
      }
      payload[k] = v;
    }

    try {
      await firstValueFrom(this.playerService.update(id, payload));
      // Volvemos al detalle para que el usuario vea los cambios aplicados.
      this.router.navigate(['/players', id], { replaceUrl: true });
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        this.errorMessage.set('Solo los administradores pueden editar jugadores.');
      } else if (status === 404) {
        this.errorMessage.set('Este jugador ya no existe.');
      } else {
        const msg = (err as { error?: { error?: string } })?.error?.error
                  ?? 'No se pudo guardar el jugador';
        this.errorMessage.set(msg);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private hasLocationData(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') return false;
    const loc = obj as { latitude?: number | null; longitude?: number | null };
    return loc.latitude != null && loc.longitude != null;
  }
}
