import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { AppComponent } from './app/app.component';
bootstrapApplication(AppComponent,{providers:[provideServiceWorker('ngsw-worker.js',{registrationStrategy:'registerWhenStable:5000'})]}).catch(err=>console.error(err));
