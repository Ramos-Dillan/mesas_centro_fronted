import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { Home } from './components/home/home';
import { MiSala } from './components/mi-sala/mi-sala';
import { Catalogo } from './components/catalogo/catalogo';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: Auth },
  { path: 'home', component: Home },
  { path: 'mi-sala', component: MiSala },
  { path: 'catalogo', component: Catalogo },
];