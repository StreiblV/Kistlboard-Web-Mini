import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { AppComponent } from './app';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: '',
    component: AppComponent,
  },
]
