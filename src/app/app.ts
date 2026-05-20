import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { Router } from '@angular/router'
import { AuthService } from './auth/auth.service'

import { CalculatedWorkflow, KistlCard, KistlColumn } from './models/kistlboard.models'
import { KistlboardService } from './services/kistlboard.service'
import { calculateWorkflow } from './workflow/kistlworkflow'
import { CHECKLIST_GROUPS, ChecklistGroup } from './workflow/kistlchecklist.config'
import { CardModalStore } from './stores/card-modal.store'
import { KistlCardComponent } from './components/kistl-card/kistl-card'
import { CardModalComponent } from './components/card-modal/card-modal'
import { ReviewModalComponent } from './components/review-modal/review-modal'
import { CreateCardModalComponent } from './components/create-card-modal/create-card-modal'

interface BoardColumn {
  column: KistlColumn
  title: string
  subtitle: string
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    FormsModule, 
    KistlCardComponent, 
    CardModalComponent, 
    ReviewModalComponent,
    CreateCardModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  cards: KistlCard[] = []
  loading = false
  error = ''

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
    private readonly auth: AuthService,

    private readonly kistlboard: KistlboardService,
    private readonly cdr: ChangeDetectorRef,
    public readonly cardModal: CardModalStore,
  ) {}

  ngOnInit(): void {

    // authentication
    this.auth.fetchCurrentUser().subscribe({
      next: (response) => {

        // not logged in
        if (!response.user) {
          this.router.navigateByUrl('/login')
          return
        }

        // logged in, load cards and subscribe to card changes
        this.cardModal.changed$.subscribe(() => {
          this.loadCards()
        })

        this.loadCards()
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

    this.kistlboard.getCards().subscribe({
      next: (cards) => {
        this.cards = cards
        this.loading = false
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Cards loading failed:', error)

        this.error = 'Karten konnten nicht geladen werden.'
        this.loading = false
        this.cdr.detectChanges()
      },
    })
  }

  cardsByColumn(column: KistlColumn): KistlCard[] {
    return this.cards.filter((card) => this.getWorkflow(card).column === column)
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