import {
  Component,
  signal,
} from '@angular/core'

import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'

import { AuthService } from '../auth.service'
import { OnInit } from '@angular/core'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {

  readonly email =
    signal('')

  readonly password =
    signal('')

  readonly error =
    signal('')

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.fetchCurrentUser().subscribe({
      next: (response) => {

        // already logged in, redirect to home
        if (response.user) {
          this.router.navigateByUrl('/')
        }
      },
    })
  }

  login(): void {

    this.error.set('')

    this.auth.login({
      email: this.email(),
      password: this.password(),
    }).subscribe({
      next: () => {
        this.router.navigateByUrl('/')
      },

      error: () => {
        this.error.set(
          'Login fehlgeschlagen.',
        )
      },
    })
  }
}