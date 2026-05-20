import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { KistlboardService } from '../../services/kistlboard.service'
import { KistlCard } from '../../models/kistlboard.models'

@Component({
  selector: 'app-create-card-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-card-modal.html',
  styleUrl: './create-card-modal.scss',
})
export class CreateCardModalComponent {
  @Input() boardId:string | number | null = null
  @Output() cardCreated = new EventEmitter<KistlCard>()

  isOpen = signal(false)
  saving = signal(false)
  error = signal('')

  newCard: Partial<KistlCard> = this.getEmptyCard()

  constructor(private readonly kistlboard: KistlboardService) {}

  open(): void {
    this.error.set('')
    this.newCard = this.getEmptyCard()
    this.isOpen.set(true)
  }

  close(): void {
    this.error.set('')
    this.saving.set(false)
    this.isOpen.set(false)
  }

  createCard(): void {
    if (!this.newCard.name?.trim()) {
      this.error.set('Bitte gib einen Namen ein.')
      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard.createCard({
      ...this.newCard,
      board: this.boardId,
    }).subscribe({
      next: (createdCard) => {
        this.cardCreated.emit(createdCard)
        this.saving.set(false)
        this.close()
      },
      error: (error) => {
        console.error(error)
        this.error.set('Karte konnte nicht erstellt werden.')
        this.saving.set(false)
      },
    })
  }

  private getEmptyCard(): Partial<KistlCard> {
    return {
      name: '',
      part: '',
      plannedPostingDate: '',
      emojiHints: '',
      gifWish: '',
      textWishes: '',
    }
  }
}