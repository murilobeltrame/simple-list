import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PasswordValidationStatus } from 'firebase/auth';

import { RegistrationService } from './registration.service';
import { Register } from './register';

const validPassword: PasswordValidationStatus = {
  isValid: true,
  passwordPolicy: {
    customStrengthOptions: { minPasswordLength: 6 },
    allowedNonAlphanumericCharacters: '',
    enforcementState: 'ENFORCE',
    forceUpgradeOnSignin: false,
  },
};

describe('Register', () => {
  const registration = {
    validatePassword: vi.fn(),
    register: vi.fn(),
  };
  const snackBar = { open: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    registration.validatePassword.mockResolvedValue(validPassword);
    registration.register.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: RegistrationService, useValue: registration },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    function fill(name: string, value: string) {
      const input = root.querySelector<HTMLInputElement>(`input[formControlName="${name}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    }
    async function submit() {
      root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await fixture.whenStable();
      fixture.detectChanges();
    }
    return { fixture, root, fill, submit };
  }

  it('displays email format and password confirmation errors without submitting', async () => {
    const { root, fill, submit } = setup();
    fill('email', 'invalid');
    fill('password', 'secret1');
    fill('confirmPassword', 'different');
    await submit();
    expect(root.textContent).toContain('Enter a valid email address');
    expect(root.textContent).toContain('Passwords do not match');
    expect(registration.register).not.toHaveBeenCalled();
  });

  it('shows unmet Firebase password policy requirements', async () => {
    registration.validatePassword.mockResolvedValue({
      ...validPassword,
      isValid: false,
      meetsMinPasswordLength: false,
      containsUppercaseLetter: false,
      passwordPolicy: {
        ...validPassword.passwordPolicy,
        customStrengthOptions: { minPasswordLength: 10, containsUppercaseLetter: true },
      },
    });
    const { root, fill, submit } = setup();
    fill('email', 'user@example.com');
    fill('password', 'short');
    fill('confirmPassword', 'short');
    await submit();
    expect(root.textContent).toContain('at least 10 characters');
    expect(root.textContent).toContain('uppercase letter');
    expect(registration.register).not.toHaveBeenCalled();
  });

  it('registers matching valid credentials and shows success', async () => {
    const { root, fill, submit } = setup();
    fill('email', 'user@example.com');
    fill('password', 'secret1');
    fill('confirmPassword', 'secret1');
    await submit();
    expect(registration.register).toHaveBeenCalledWith('user@example.com', 'secret1');
    expect(root.textContent).toContain('Account created');
  });

  it('shows a toast if registration fails', async () => {
    registration.register.mockRejectedValue({ code: 'auth/email-already-in-use' });
    const { fill, submit } = setup();
    fill('email', 'user@example.com');
    fill('password', 'secret1');
    fill('confirmPassword', 'secret1');
    await submit();
    expect(snackBar.open).toHaveBeenCalledWith(expect.stringContaining('already'), 'Dismiss', expect.any(Object));
  });

  it('shows a toast and does not register when policy validation fails', async () => {
    registration.validatePassword.mockRejectedValue(new Error('Network error'));
    const { fill, submit } = setup();
    fill('email', 'user@example.com');
    fill('password', 'secret1');
    fill('confirmPassword', 'secret1');
    await submit();
    expect(snackBar.open).toHaveBeenCalledWith(expect.stringContaining('password'), 'Dismiss', expect.any(Object));
    expect(registration.register).not.toHaveBeenCalled();
  });

  it('ignores repeated submissions while the password check is pending', async () => {
    let resolveValidation!: (value: PasswordValidationStatus) => void;
    registration.validatePassword.mockReturnValue(new Promise<PasswordValidationStatus>((resolve) => {
      resolveValidation = resolve;
    }));
    const { root, fixture, fill } = setup();
    fill('email', 'user@example.com');
    fill('password', 'secret1');
    fill('confirmPassword', 'secret1');
    const form = root.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(registration.validatePassword).toHaveBeenCalledTimes(1);
    resolveValidation(validPassword);
    await fixture.whenStable();
    expect(registration.register).toHaveBeenCalledTimes(1);
  });
});
