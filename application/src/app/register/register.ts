import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import type { PasswordValidationStatus } from 'firebase/auth';

import { RegistrationService } from './registration.service';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;
  return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
}

function passwordErrors(status: PasswordValidationStatus): string[] {
  const options = status.passwordPolicy.customStrengthOptions;
  const errors: string[] = [];
  if (status.meetsMinPasswordLength === false) {
    errors.push(`Use at least ${options.minPasswordLength} characters.`);
  }
  if (status.meetsMaxPasswordLength === false) {
    errors.push(`Use no more than ${options.maxPasswordLength} characters.`);
  }
  if (status.containsLowercaseLetter === false) errors.push('Include a lowercase letter.');
  if (status.containsUppercaseLetter === false) errors.push('Include an uppercase letter.');
  if (status.containsNumericCharacter === false) errors.push('Include a number.');
  if (status.containsNonAlphanumericCharacter === false) errors.push('Include a special character.');
  return errors.length ? errors : ['Password does not meet the configured requirements.'];
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly registration = inject(RegistrationService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly submitting = signal(false);
  protected readonly completed = signal(false);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  }, { validators: matchingPasswords });

  protected readonly confirmationMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null, form: FormGroupDirective | NgForm | null) =>
      !!control && (control.touched || !!form?.submitted) &&
      (control.invalid || !!control.parent?.hasError('passwordMismatch')),
  };

  protected async submit(): Promise<void> {
    if (this.submitting() || this.completed()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();
    try {
      let status: PasswordValidationStatus;
      try {
        status = await this.registration.validatePassword(password);
      } catch {
        this.showError('Unable to check password requirements. Please try again.');
        return;
      }

      if (!status.isValid) {
        this.form.controls.password.setErrors({ passwordPolicy: passwordErrors(status) });
        return;
      }

      try {
        await this.registration.register(email, password);
        this.completed.set(true);
      } catch (error: unknown) {
        const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
        const message = code === 'auth/email-already-in-use'
          ? 'This email address is already in use.'
          : code === 'auth/weak-password'
            ? 'The password does not meet Firebase requirements. Please try another.'
            : 'Could not create your account. Please try again.';
        this.showError(message);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 6000 });
  }
}
