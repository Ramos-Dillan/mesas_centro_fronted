import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss']
})
export class Auth {

  isSignUpActive = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  loadingLogin = false;
  loadingRegister = false;

  loginError = '';
  registerError = '';
  registerSuccess = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });

    this.registerForm = this.fb.group({
      username: [''],
      email: [''],
      password: ['']
});
  }

  showSignUp(): void {
    this.isSignUpActive = true;
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
  }

  showSignIn(): void {
    this.isSignUpActive = false;
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
  }

  async onLogin(): Promise<void> {
    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.loginError = '⚠️ Completa todos los campos';
      return;
    }

    this.loadingLogin = true;
    this.loginError = '';
    this.cdr.detectChanges();

    try {
      await firstValueFrom(
        this.authService.login(email, password).pipe(timeout(30000))
      );
      this.router.navigateByUrl('/home');
    } catch (err: any) {
      console.error('Login error', err);

      if (err?.name === 'TimeoutError') {
        this.loginError = '⏱️ El servidor tardó demasiado';
      } else if (err?.status === 0) {
        this.loginError = '🌐 No hay conexión con el servidor';
      } else if (err?.status === 401) {
        this.loginError = '❌ Usuario o contraseña incorrectos';
      } else {
        this.loginError = err?.error?.message || '❌ Error inesperado';
      }

      this.cdr.detectChanges();
    } finally {
      this.loadingLogin = false;
      this.cdr.detectChanges();
    }
  }

  async onRegister(): Promise<void> {
  const { username, email, password } = this.registerForm.value;

  if (!username || !email || !password) {
    this.registerError = '⚠️ Completa todos los campos';
    return;
  }

  this.loadingRegister = true;
  this.registerError = '';
  this.registerSuccess = '';
  this.cdr.detectChanges();

  try {
    await firstValueFrom(
      this.authService.register(username, email, password).pipe(timeout(30000))
    );

    this.registerSuccess = '✅ Cuenta creada. Ahora inicia sesión.';
    this.registerForm.reset();

    setTimeout(() => this.showSignIn(), 1400);

  } catch (err: any) {
    console.error('Register error', err);

    if (err?.name === 'TimeoutError') {
      this.registerError = '⏱️ El servidor tardó demasiado';
    } else if (err?.status === 0) {
      this.registerError = '🌐 No hay conexión con el servidor';
    } else if (err?.status === 400) {
      this.registerError = err?.error?.message || '❌ El usuario o correo ya existe';
    } else {
      this.registerError = err?.error?.message || '❌ Error inesperado';
    }

    this.cdr.detectChanges();
  } finally {
    this.loadingRegister = false;
    this.cdr.detectChanges();
  }
}
}