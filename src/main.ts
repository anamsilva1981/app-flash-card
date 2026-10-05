import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { SessionComponent } from './app/session.component';
bootstrapApplication(SessionComponent,{providers:[provideServiceWorker('ngsw-worker.js',{registrationStrategy:'registerWhenStable:5000'})]}).catch(err=>console.error(err));
