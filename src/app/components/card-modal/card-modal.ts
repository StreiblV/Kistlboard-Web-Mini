import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { CardModalStore } from '../../stores/card-modal.store'
import { calculateWorkflow } from '../../workflow/kistlworkflow'

@Component({
  selector: 'app-card-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './card-modal.html',
  styleUrl: './card-modal.scss',
})
export class CardModalComponent {
  constructor(public readonly cardModal: CardModalStore) {}

  getWorkflow = calculateWorkflow
}