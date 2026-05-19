import { Injectable, inject, signal } from '@angular/core'
import { Subject, forkJoin } from 'rxjs'

import { KistlboardService } from '../services/kistlboard.service'
import { KistlCard, KistlMedia } from '../models/kistlboard.models'
import {
  CHECKLIST_GROUPS,
  ChecklistGroup,
  ChecklistKey,
} from '../workflow/kistlchecklist.config'
import { calculateWorkflow } from '../workflow/kistlworkflow'
import { getPreviousStepPatch } from '../workflow/kistl-previous-step'

type AssetType = NonNullable<KistlMedia['assetType']>

@Injectable({
  providedIn: 'root',
})
export class CardModalStore {
  private readonly kistlboard = inject(KistlboardService)

  readonly selectedCard = signal<KistlCard | null>(null)
  readonly error = signal('')
  readonly saving = signal(false)
  readonly uploading = signal(false)
  readonly selectedAssetType = signal<AssetType>('other')

  readonly changed$ = new Subject<void>()

  readonly checklistGroups: ChecklistGroup[] = CHECKLIST_GROUPS

  readonly assetTypeOptions: { label: string; value: AssetType }[] = [
    { label: 'Artwork', value: 'artwork' },
    { label: 'Figure / Silhouette', value: 'figure' },
    { label: 'Drawing Clip', value: 'drawing-clip' },
    { label: 'Reveal Clip', value: 'reveal-clip' },
    { label: 'Final Video', value: 'final-video' },
    { label: 'Other', value: 'other' },
  ]

  open(card: KistlCard): void {
    this.error.set('')
    this.saving.set(false)
    this.uploading.set(false)
    this.selectedAssetType.set('other')
    this.selectedCard.set(this.prepareCardForEditing(card))
  }

  close(): void {
    this.error.set('')
    this.saving.set(false)
    this.uploading.set(false)
    this.selectedCard.set(null)
  }

  saveSelectedCard(): void {
    const card = this.selectedCard()

    if (!card) {
      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard.saveDetails(card).subscribe({
      next: (updatedCard) => {
        this.selectedCard.set(
          this.prepareCardForEditing(
            this.mergeUpdatedCardWithCurrentAssets(card, updatedCard),
          ),
        )

        this.saving.set(false)
        this.changed$.next()
      },
      error: (error) => {
        console.error(error)
        this.error.set(this.getErrorMessage(error, 'Karte konnte nicht gespeichert werden.'))
        this.saving.set(false)
      },
    })
  }

  toggleChecklistItem(
    card: KistlCard,
    key: ChecklistKey,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement

    this.error.set('')

    this.kistlboard.toggleChecklistItem(card, key, input.checked).subscribe({
      next: (updatedCard) => {
        this.selectedCard.set(
          this.prepareCardForEditing(
            this.mergeUpdatedCardWithCurrentAssets(card, updatedCard),
          ),
        )

        this.changed$.next()
      },
      error: (error) => {
        console.error(error)
        this.error.set(this.getErrorMessage(error, 'Checklist konnte nicht aktualisiert werden.'))

        input.checked = !input.checked
      },
    })
  }

  isPlanningCard(card: KistlCard): boolean {
    return calculateWorkflow(card).column === 'planning'
  }

  startWorkflow(card: KistlCard): void {
    this.error.set('')
    this.saving.set(true)

    this.kistlboard.updateCard(card.id, {
        checklist: {
        ...(card.checklist || {}),
        workflowStarted: true,
        },
    }).subscribe({
        next: (updatedCard) => {
        this.selectedCard.set(
            this.prepareCardForEditing(
            this.mergeUpdatedCardWithCurrentAssets(card, updatedCard),
            ),
        )

        this.saving.set(false)
        this.changed$.next()
        },
        error: (error) => {
        console.error(error)
        this.error.set(this.getErrorMessage(error, 'Workflow konnte nicht gestartet werden.'))
        this.saving.set(false)
        },
    })
  }

  moveSelectedCardToPreviousStep(): void {
    const card = this.selectedCard()

    if (!card) {
      return
    }

    const result = getPreviousStepPatch(card)

    if (!result.patch) {
      this.error.set(result.error || 'Diese Karte kann nicht zurückgesetzt werden.')
      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard.updateCard(card.id, result.patch).subscribe({
      next: (updatedCard) => {
        this.selectedCard.set(
          this.prepareCardForEditing(
            this.mergeUpdatedCardWithCurrentAssets(card, updatedCard),
          ),
        )

        this.saving.set(false)
        this.changed$.next()
      },
      error: (error) => {
        console.error(error)
        this.error.set(this.getErrorMessage(error, 'Karte konnte nicht zurückgesetzt werden.'))
        this.saving.set(false)
      },
    })
  }

  archiveSelectedCard(): void {
    const card = this.selectedCard()

    if (!card) {
      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard.archive(card).subscribe({
      next: () => {
        this.saving.set(false)
        this.close()
        this.changed$.next()
      },
      error: (error) => {
        console.error(error)
        this.error.set(this.getErrorMessage(error, 'Karte konnte nicht archiviert werden.'))
        this.saving.set(false)
      },
    })
  }

  setSelectedAssetType(assetType: string): void {
    this.selectedAssetType.set(assetType as AssetType)
  }

  uploadMediaFiles(card: KistlCard, event: Event): void {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])

    if (files.length === 0) {
      return
    }

    this.error.set('')
    this.uploading.set(true)

    forkJoin(
      files.map((file) =>
        this.kistlboard.uploadMedia(
          card.id,
          file,
          this.selectedAssetType(),
        ),
      ),
    ).subscribe({
      next: (uploadedMedia) => {
        const currentCard = this.selectedCard()

        if (currentCard) {
          this.selectedCard.set(
            this.prepareCardForEditing(
              this.addAssetsToCard(currentCard, uploadedMedia),
            ),
          )
        }

        this.uploading.set(false)
        this.changed$.next()
        input.value = ''
      },
      error: (error) => {
        console.error(error)
        this.error.set(this.getErrorMessage(error, 'Medien konnten nicht hochgeladen werden.'))
        this.uploading.set(false)
        input.value = ''
      },
    })
  }

  isChecklistChecked(card: KistlCard, key: ChecklistKey): boolean {
    return Boolean(card.checklist?.[key])
  }

  getVisibleChecklistGroups(card: KistlCard): ChecklistGroup[] {
    const column = calculateWorkflow(card).column

    return this.checklistGroups.filter((group) =>
      group.columns.includes(column),
    )
  }

  hasVisibleChecklist(card: KistlCard): boolean {
    return this.getVisibleChecklistGroups(card).length > 0
  }

  getAssets(card: KistlCard): KistlMedia[] {
    const assets = card.assets

    if (!assets) {
      return []
    }

    if (Array.isArray(assets)) {
      return assets
    }

    return assets.docs || []
  }

  getAssetTypeLabel(asset: KistlMedia): string {
    const labels: Record<string, string> = {
      artwork: 'Artwork',
      figure: 'Figure / Silhouette',
      'drawing-clip': 'Drawing Clip',
      'reveal-clip': 'Reveal Clip',
      'final-video': 'Final Video',
      other: 'Other',
    }

    return labels[asset.assetType || 'other'] || 'Other'
  }

  formatFileSize(size?: number): string {
    if (!size) {
      return ''
    }

    const mb = size / 1024 / 1024

    return `${mb.toFixed(1)} MB`
  }

  showReviewComments(card: KistlCard): boolean {
    const column = calculateWorkflow(card).column

    return (
        column === 'video-editing' ||
        column === 'review'
    )
  }

  showCaption(card: KistlCard): boolean {
    const column = calculateWorkflow(card).column

    return (
        column === 'review' ||
        column === 'content' ||
        column === 'scheduled' ||
        column === 'done'
    )
  }

  private prepareCardForEditing(card: KistlCard): KistlCard {
    const clonedCard = structuredClone(card)

    if (clonedCard.plannedPostingDate) {
        clonedCard.plannedPostingDate =
        clonedCard.plannedPostingDate.slice(0, 10)
    }

    clonedCard.review = {
        status: clonedCard.review?.status || 'none',
        comment: clonedCard.review?.comment || '',
    }

    return clonedCard
  }

  private mergeUpdatedCardWithCurrentAssets(
    currentCard: KistlCard,
    updatedCard: KistlCard,
  ): KistlCard {
    return {
      ...updatedCard,
      assets: updatedCard.assets ?? currentCard.assets,
    }
  }

  private addAssetsToCard(card: KistlCard, uploadedMedia: KistlMedia[]): KistlCard {
    const assets = card.assets

    if (Array.isArray(assets)) {
      return {
        ...card,
        assets: [...assets, ...uploadedMedia],
      }
    }

    return {
      ...card,
      assets: {
        ...(assets || {}),
        docs: [...(assets?.docs || []), ...uploadedMedia],
        totalDocs: (assets?.totalDocs || 0) + uploadedMedia.length,
      },
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message
    }

    return fallback
  }
}