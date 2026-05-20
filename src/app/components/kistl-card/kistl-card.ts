import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'

import { CalculatedWorkflow, KistlCard } from '../../models/kistlboard.models'
import { calculateWorkflow } from '../../workflow/kistlworkflow'

@Component({
  selector: 'app-kistl-card',
  imports: [CommonModule],
  templateUrl: './kistl-card.html',
  styleUrl: './kistl-card.scss',
})
export class KistlCardComponent {
  @Input({ required: true }) card!: KistlCard
  @Output() cardClick = new EventEmitter<KistlCard>()

  get workflow(): CalculatedWorkflow {
    return calculateWorkflow(this.card)
  }

  open(): void {
    this.cardClick.emit(this.card)
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