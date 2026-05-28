import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class LoginPage {}
