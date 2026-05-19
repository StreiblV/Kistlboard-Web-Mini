import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core'

import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { KistlCard } from '../../models/kistlboard.models'
import { CardModalStore } from '../../stores/card-modal.store'

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-modal.html',
  styleUrl: './review-modal.scss',
})
export class ReviewModalComponent {
  @Input({ required: true })
  card!: KistlCard

  @Output()
  close = new EventEmitter<void>()

  readonly cardModal = inject(CardModalStore)

  approve(): void {
    this.cardModal.approveReview(this.card)
  }

  decline(): void {
    this.cardModal.declineReview(this.card)
  }

  canDecline(): boolean {
    return Boolean(
      this.card.review?.comment?.trim(),
    )
  }

  getVideoUrl(): string | null {
    const finalVideo = this.card.finalVideo

    if (!finalVideo) {
      return null
    }

    if (
      typeof finalVideo === 'string' ||
      typeof finalVideo === 'number'
    ) {
      return null
    }

    return finalVideo.url || null
  }
}