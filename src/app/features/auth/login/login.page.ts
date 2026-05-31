import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  constructor() {
    // Si Firebase resuelve que el usuario YA tiene sesión activa
    // (token en localStorage, no caducado), saltamos directos al
    // listado sin obligarle a re-autenticarse.
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.router.navigateByUrl('/players', { replaceUrl: true });
      }
    });
  }

  async submit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      this.router.navigate(['/players']);
    } catch (err) {
      this.errorMessage.set(this.toFriendlyMessage(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Traduce los códigos de error Firebase a mensajes legibles. */
  private toFriendlyMessage(err: unknown): string {
    const code = (err as { code?: string }).code ?? '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email o contraseña incorrectos.';
      case 'auth/invalid-email':
        return 'Email no válido.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera unos minutos.';
      default:
        return 'No se pudo iniciar sesión. Intenta de nuevo.';
    }
  }
}
