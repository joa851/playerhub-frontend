import { Injectable, computed, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly app: FirebaseApp;
  private readonly auth: Auth;

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    onAuthStateChanged(this.auth, (user) => this.currentUser.set(user));
  }

  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Devuelve el ID token del usuario actual o null si no hay sesión.
   * Se usará cuando backend necesite el token en `Authorization: Bearer`.
   */
  async getIdToken(): Promise<string | null> {
    const user = this.currentUser();
    return user ? await user.getIdToken() : null;
  }
}
