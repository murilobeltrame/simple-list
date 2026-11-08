import { mergeApplicationConfig, ApplicationConfig, makeStateKey, TransferState, APP_INITIALIZER } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig, firebaseConfigStateKey } from './app.config';
import { serverRoutes } from './app.routes.server';
import * as dotenv from 'dotenv';

dotenv.config();

const envStateKey = makeStateKey('env');

function requiredFirebaseValue(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function transferStateFactory(transferState: TransferState) {
  return () => {
    transferState.set(firebaseConfigStateKey, {
      apiKey: requiredFirebaseValue('FIREBASE_API_KEY'),
      authDomain: requiredFirebaseValue('FIREBASE_AUTH_DOMAIN'),
      projectId: requiredFirebaseValue('FIREBASE_PROJECT_ID'),
      storageBucket: requiredFirebaseValue('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: requiredFirebaseValue('FIREBASE_MESSAGING_SENDER_ID'),
      appId: requiredFirebaseValue('FIREBASE_APP_ID'),
      measurementId: requiredFirebaseValue('FIREBASE_MEASUREMENT_ID'),
    });
  };
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: APP_INITIALIZER,
      useFactory: transferStateFactory,
      deps: [TransferState],
      multi: true
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
