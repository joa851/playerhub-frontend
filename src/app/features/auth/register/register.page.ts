import { Component, inject, signal } from '@angular/core';
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
  selector: 'app-register',
  templateUrl: 'register.page.html',
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
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  async submit() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.register(email, password);
      // Tras registrarse, Firebase ya deja al usuario logueado.
      this.router.navigate(['/players']);
    } catch (err) {
      this.errorMessage.set(this.toFriendlyMessage(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  private toFriendlyMessage(err: unknown): string {
    const code = (err as { code?: string }).code ?? '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ese email ya está registrado.';
      case 'auth/invalid-email':
        return 'Email no válido.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil (mínimo 6 caracteres).';
      default:
        return 'No se pudo crear la cuenta. Intenta de nuevo.';
    }
  }
}
