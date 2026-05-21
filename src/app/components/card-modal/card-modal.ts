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

  async downloadAsset(asset: KistlMedia, event: MouseEvent): Promise<void> {
    event.preventDefault()
    event.stopPropagation()

    if (!asset.url) {
      return
    }

    const response = await fetch(asset.url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = objectUrl
    link.download = asset.filename || 'download'
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(objectUrl)
  }
}
