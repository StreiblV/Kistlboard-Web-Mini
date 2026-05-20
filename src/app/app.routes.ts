import { Routes } from '@angular/router';
import { AppComponent } from './app';

import { LoginComponent } from './auth/login/login';
import { BoardPageComponent } from './pages/board-page/board-page'
import { BoardsPageComponent } from './pages/boards-page/boards-page'


export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: '',
    redirectTo: 'boards',
    pathMatch: 'full',
  },

  {
    path: 'boards',
    component: BoardsPageComponent,
  },

  {
    path: 'boards/:slug',
    component: BoardPageComponent,
  },
]
