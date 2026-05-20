import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Observable, tap } from 'rxjs'

import {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from './auth.models'

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  readonly currentUser =
    signal<AuthUser | null>(null)

  readonly loading =
    signal(false)

  readonly initialized =
    signal(false)

  constructor(
    private readonly http: HttpClient,
  ) {}

  // -------------------------
  // Login
  // -------------------------

  login(
    credentials: LoginRequest,
  ): Observable<LoginResponse> {

    this.loading.set(true)

    return this.http.post<LoginResponse>(
      '/api/users/login',
      credentials,
      {
        withCredentials: true,
      },
    ).pipe(
      tap({
        next: (response) => {
          this.currentUser.set(
            response.user,
          )

          this.loading.set(false)
        },

        error: () => {
          this.loading.set(false)
        },
      }),
    )
  }

  // -------------------------
  // Logout
  // -------------------------

  logout(): Observable<unknown> {

    return this.http.post(
      '/api/users/logout',
      {},
      {
        withCredentials: true,
      },
    ).pipe(
      tap(() => {
        this.currentUser.set(null)
      }),
    )
  }

  // -------------------------
  // Current User
  // -------------------------

  fetchCurrentUser(): Observable<{
    user: AuthUser | null
  }> {

    return this.http.get<{
      user: AuthUser | null
    }>(
      '/api/users/me',
      {
        withCredentials: true,
      },
    ).pipe(
      tap((response) => {
        this.currentUser.set(
          response.user,
        )

        this.initialized.set(true)
      }),
    )
  }

  // -------------------------
  // Helpers
  // -------------------------

  isLoggedIn(): boolean {
    return Boolean(
      this.currentUser(),
    )
  }

  isAdmin(): boolean {
    return (
      this.currentUser()?.role ===
      'admin'
    )
  }
}