import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewModalComponent {
  @Input({ required: true })
  card!: KistlCard

  constructor(public readonly cardModal: CardModalStore) {}

  get reviewComment(): string {
    return this.card.review?.comment || ''
  }

  set reviewComment(value: string) {
    this.card.review = {
      ...(this.card.review || {}),
      comment: value,
    }
  }

  reviewVideoUrl(): string | null {
    const video = this.card.finalVideo

    if (!video || typeof video === 'string' || typeof video === 'number') {
      return null
    }

    return video.url || null
  }

  loading() {
    return this.cardModal.saving()
  }

  error() {
    return this.cardModal.error()
  }

  approve(): void {
    this.cardModal.approveReview(this.card)
  }

  decline(): void {
    this.cardModal.declineReview(this.card)
  }
}
