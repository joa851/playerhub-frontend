import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-player-create',
  templateUrl: 'create.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class CreatePage {}
