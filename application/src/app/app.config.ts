import {
  ApplicationConfig,
  makeStateKey,
  provideBrowserGlobalErrorListeners,
  TransferState,
} from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideRouter } from '@angular/router';
import type { FirebaseOptions } from 'firebase/app';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const firebaseConfigStateKey =
  makeStateKey<FirebaseOptions | null>('firebase-config');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideFirebaseApp((injector) => {
      const firebaseConfig = injector.get(TransferState).get(firebaseConfigStateKey, null);
      if (!firebaseConfig) {
        throw new Error('Firebase configuration is missing from TransferState.');
      }
      return initializeApp(firebaseConfig);
    })
  ]
};
