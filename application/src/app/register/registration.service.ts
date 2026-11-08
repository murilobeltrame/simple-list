import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { createUserWithEmailAndPassword, getAuth, validatePassword } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly app = inject(FirebaseApp);

  validatePassword(password: string) {
    return validatePassword(getAuth(this.app), password);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(getAuth(this.app), email, password);
  }
}
