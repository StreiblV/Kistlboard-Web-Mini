import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { CardModalStore } from '../../stores/card-modal.store'
import { calculateWorkflow } from '../../workflow/kistlworkflow'
import { KistlMedia } from '../../models/kistlboard.models'

@Component({
  selector: 'app-card-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './card-modal.html',
  styleUrl: './card-modal.scss',
})
export class CardModalComponent {
  constructor(public readonly cardModal: CardModalStore) {}

  getWorkflow = calculateWorkflow

  downloadAsset(asset: KistlMedia, event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()

    window.open(
      asset.url,
      '_blank',
    )
  }
}