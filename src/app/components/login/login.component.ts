import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  async onSubmit(): Promise<void> {

    const { email, password } = this.form.value;

    if (!email || !password) {
      this.errorMsg = '⚠️ Completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {

      await firstValueFrom(
        this.authService.login(email, password).pipe(timeout(5000))
      );

      await this.router.navigate(['/catalogo']).then(() => {
        window.location.reload();
      });

    } catch (err: any) {

      console.error('Login error', err);

      if (err?.name === 'TimeoutError') {
        this.errorMsg = '⏱️ El servidor tardó demasiado';

      } else if (err?.status === 0) {
        this.errorMsg = '🌐 No hay conexión con el servidor';

      } else if (err?.status === 401) {
        this.errorMsg = '❌ Usuario o contraseña incorrectos';

      } else {
        this.errorMsg = err?.error?.message || '❌ Error inesperado';
      }

    } finally {

      this.loading = false;

    }
  }
}