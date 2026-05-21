import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'

import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'

import { AuthService } from '../../auth/auth.service'
import { Board } from '../../models/kistlboard.models'
import { KistlboardService } from '../../services/kistlboard.service'

@Component({
  selector: 'app-boards-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boards-page.html',
  styleUrl: './boards-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsPageComponent implements OnInit {
  boards: Board[] = []

  loading = true
  error = ''

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly title: Title,

    private readonly kistlboard: KistlboardService,
  ) {}

  ngOnInit(): void {
    this.auth.fetchCurrentUser().subscribe({
      next: () => {
        if (!this.auth.isLoggedIn()) {
          this.router.navigateByUrl('/login')
          return
        }
        this.title.setTitle(`Kistlboard`)

        this.kistlboard.getBoards().subscribe({
          next: (boards) => {
            this.boards = boards
            this.loading = false
            this.cdr.detectChanges()
          },

          error: (error) => {
            console.error(error)
            this.error = 'Boards konnten nicht geladen werden.'
            this.loading = false
            this.cdr.detectChanges()
          },
        })
      },

      error: () => {
        this.router.navigateByUrl('/login')
      },
    })
  }

  openBoard(board: Board): void {
    this.router.navigateByUrl(`/boards/${board.slug}`)
  }
}
