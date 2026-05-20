import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'

import { AuthService } from '../../auth/auth.service'

import {
  CalculatedWorkflow,
  KistlCard,
  KistlColumn,
} from '../../models/kistlboard.models'

import { KistlboardService } from '../../services/kistlboard.service'
import { calculateWorkflow } from '../../workflow/kistlworkflow'
import {
  CHECKLIST_GROUPS,
  ChecklistGroup,
} from '../../workflow/kistlchecklist.config'

import { CardModalStore } from '../../stores/card-modal.store'

import { KistlCardComponent } from '../../components/kistl-card/kistl-card'
import { CardModalComponent } from '../../components/card-modal/card-modal'
import { ReviewModalComponent } from '../../components/review-modal/review-modal'
import { CreateCardModalComponent } from '../../components/create-card-modal/create-card-modal'

interface BoardColumn {
  column: KistlColumn
  title: string
  subtitle: string
}

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,

    KistlCardComponent,
    CardModalComponent,
    ReviewModalComponent,
    CreateCardModalComponent,
  ],
  templateUrl: './board-page.html',
  styleUrl: './board-page.scss',
})
export class BoardPageComponent implements OnInit {

  cards: KistlCard[] = []

  loading = false
  error = ''

  currentBoardSlug = ''
  currentBoardId: string | number | null = null

  checklistGroups: ChecklistGroup[] = CHECKLIST_GROUPS

  columns: BoardColumn[] = [
    {
      column: 'planning',
      title: 'In Planning',
      subtitle: 'Neue Characters & offene Ideen',
    },
    {
      column: 'drawing',
      title: 'Drawing',
      subtitle: 'Artwork & Artist Uploads',
    },
    {
      column: 'video-editing',
      title: 'Video Editing',
      subtitle: 'Schnitt, Render & Rework',
    },
    {
      column: 'review',
      title: 'In Review',
      subtitle: 'Final Video prüfen',
    },
    {
      column: 'content',
      title: 'Content',
      subtitle: 'Caption & Posting vorbereiten',
    },
    {
      column: 'scheduled',
      title: 'Scheduled',
      subtitle: 'Post ist eingeplant',
    },
    {
      column: 'done',
      title: 'Done',
      subtitle: 'Scheduled oder veröffentlicht',
    },
  ]

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly kistlboard: KistlboardService,
    private readonly cdr: ChangeDetectorRef,
    private readonly title: Title,

    public readonly auth: AuthService,
    public readonly cardModal: CardModalStore,
  ) {}

  ngOnInit(): void {

    this.auth.fetchCurrentUser().subscribe({
      next: () => {

        if (!this.auth.isLoggedIn()) {
          this.router.navigateByUrl('/login')
          return
        }

        this.cardModal.changed$.subscribe(() => {
          this.loadCards()
        })

        this.route.paramMap.subscribe((params) => {

          const slug = params.get('slug')

          if (!slug) {
            return
          }

          this.currentBoardSlug = slug
          this.kistlboard.getBoardBySlug(slug).subscribe({
            next: (board) => {

              if (!board) {
                this.router.navigateByUrl('/boards')
                return
              }
              this.currentBoardId = board.id
              this.title.setTitle(
                `${board.name} | Kistlboard`,
              )
              this.loadCards()
            },

            error: () => {
              this.router.navigateByUrl('/boards')
            },
          })
        })
      },

      error: () => {
        this.router.navigateByUrl('/login')
      },
    })
  }

  loadCards(): void {

    this.loading = true
    this.error = ''

    this.cdr.detectChanges()

    this.kistlboard
      .getCards(this.currentBoardSlug)
      .subscribe({

        next: (cards) => {
          this.cards = cards
          this.loading = false
          this.cdr.detectChanges()
        },

        error: (error) => {
          console.error(
            'Cards loading failed:',
            error,
          )

          this.error = 'Karten konnten nicht geladen werden.'
          this.loading = false
          this.cdr.detectChanges()
        },
      })
  }

  cardsByColumn(column: KistlColumn): KistlCard[] {
    return this.cards.filter(
      (card) =>
        this.getWorkflow(card).column === column,
    )
  }

  getWorkflow(card: KistlCard): CalculatedWorkflow {
    return calculateWorkflow(card)
  }

  formatShortDate(date?: string): string {

    if (!date) {
      return 'kein Datum'
    }

    return new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: 'long',
    }).format(new Date(date))
  }
}