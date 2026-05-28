import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class RegisterPage {}
