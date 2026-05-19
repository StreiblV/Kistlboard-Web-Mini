import { Injectable, inject, signal } from '@angular/core'
import { Subject, forkJoin } from 'rxjs'

import { KistlboardService } from '../services/kistlboard.service'

import {
  KistlCard,
  KistlMedia,
} from '../models/kistlboard.models'

import {
  CHECKLIST_GROUPS,
  ChecklistGroup,
  ChecklistKey,
} from '../workflow/kistlchecklist.config'

import {
  addAssetsToCard,
  formatFileSize,
  getAssets,
  getAssetTypeLabel,
  mergeUpdatedCardWithCurrentAssets,
} from '../workflow/assets'

import {
  getVisibleChecklistGroups,
  hasVisibleChecklist,
  showCaption,
  showFinalVideoSelector,
  showReviewComments,
} from '../workflow/visibility'

import {
  prepareCardForEditing,
  getErrorMessage,
} from '../workflow/card-utils'

import {
  isPlanningCard,
} from '../workflow/actions'

import {
  getPreviousStepPatch,
} from '../workflow/kistl-previous-step'

import {
  approveReviewPatch,
  declineReviewPatch,
} from '../workflow/review-actions'

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

  readonly checklistGroups: ChecklistGroup[] =
    CHECKLIST_GROUPS

  readonly assetTypeOptions: {
    label: string
    value: AssetType
  }[] = [
    {
      label: 'Artwork',
      value: 'artwork',
    },
    {
      label: 'Figure / Silhouette',
      value: 'figure',
    },
    {
      label: 'Drawing Clip',
      value: 'drawing-clip',
    },
    {
      label: 'Reveal Clip',
      value: 'reveal-clip',
    },
    {
      label: 'Final Video',
      value: 'final-video',
    },
    {
      label: 'Other',
      value: 'other',
    },
  ]

  // -------------------------
  // Public helper bindings
  // -------------------------
  readonly getAssets = getAssets
  readonly getAssetTypeLabel = getAssetTypeLabel
  readonly formatFileSize = formatFileSize
  readonly showReviewComments = showReviewComments
  readonly showCaption = showCaption
  readonly getVisibleChecklistGroups = getVisibleChecklistGroups
  readonly hasVisibleChecklist = hasVisibleChecklist
  readonly isPlanningCard = isPlanningCard
  readonly showFinalVideoSelector = showFinalVideoSelector

  isChecklistChecked(
    card: KistlCard,
    key: ChecklistKey,
  ): boolean {
    return Boolean(card.checklist?.[key])
  }

  // -------------------------
  // Modal lifecycle
  // -------------------------

  open(card: KistlCard): void {
    this.error.set('')
    this.saving.set(false)
    this.uploading.set(false)

    this.selectedAssetType.set('other')

    this.selectedCard.set(
      prepareCardForEditing(card),
    )
  }

  close(): void {
    this.error.set('')
    this.saving.set(false)
    this.uploading.set(false)

    this.selectedCard.set(null)
  }

  // -------------------------
  // Save card details
  // -------------------------

  saveSelectedCard(): void {
    const card = this.selectedCard()

    if (!card) {
      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .saveDetails(card)
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.saving.set(false)

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Karte konnte nicht gespeichert werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }

  // -------------------------
  // Checklist handling
  // -------------------------

  toggleChecklistItem(
    card: KistlCard,
    key: ChecklistKey,
    event: Event,
  ): void {
    const input =
      event.target as HTMLInputElement

    this.error.set('')

    this.kistlboard
      .toggleChecklistItem(
        card,
        key,
        input.checked,
      )
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Checklist konnte nicht aktualisiert werden.',
            ),
          )

          // visually revert checkbox
          input.checked = !input.checked
        },
      })
  }

  // -------------------------
  // Workflow actions
  // -------------------------

  startWorkflow(
    card: KistlCard,
  ): void {
    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .updateCard(card.id, {
        checklist: {
          ...(card.checklist || {}),
          workflowStarted: true,
        },
      })
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.saving.set(false)

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Workflow konnte nicht gestartet werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }

  moveSelectedCardToPreviousStep(): void {
    const card = this.selectedCard()

    if (!card) {
      return
    }

    const result =
      getPreviousStepPatch(card)

    if (!result.patch) {
      this.error.set(
        result.error ||
          'Diese Karte kann nicht zurückgesetzt werden.',
      )

      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .updateCard(card.id, result.patch)
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.saving.set(false)

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Karte konnte nicht zurückgesetzt werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }

  // -------------------------
  // Archive
  // -------------------------

  archiveSelectedCard(): void {
    const card = this.selectedCard()

    if (!card) {
      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .archive(card)
      .subscribe({
        next: () => {
          this.saving.set(false)

          this.close()

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Karte konnte nicht archiviert werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }

  // -------------------------
  // Uploads
  // -------------------------

  setSelectedAssetType(
    assetType: string,
  ): void {
    this.selectedAssetType.set(
      assetType as AssetType,
    )
  }

  uploadMediaFiles(
    card: KistlCard,
    event: Event,
  ): void {
    const input =
      event.target as HTMLInputElement

    const files = Array.from(
      input.files || [],
    )

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
        const currentCard =
          this.selectedCard()

        if (currentCard) {
          this.selectedCard.set(
            prepareCardForEditing(
              addAssetsToCard(
                currentCard,
                uploadedMedia,
              ),
            ),
          )
        }

        this.uploading.set(false)

        this.changed$.next()

        input.value = ''
      },

      error: (error) => {
        console.error(error)

        this.error.set(
          getErrorMessage(
            error,
            'Medien konnten nicht hochgeladen werden.',
          ),
        )

        this.uploading.set(false)

        input.value = ''
      },
    })
  }

  // -------------------------
  // Final Video Selection
  // -------------------------

  getFinalVideoOptions(
    card: KistlCard,
  ): KistlMedia[] {
    return this.getAssets(card).filter(
      (asset) =>
        asset.assetType === 'final-video',
    )
  }

  getSelectedFinalVideoId(
  card: KistlCard,
): string | number | null {
  if (!card.finalVideo) {
    return null
  }

  if (
    typeof card.finalVideo === 'string' ||
    typeof card.finalVideo === 'number'
  ) {
    return card.finalVideo
  }

  return card.finalVideo.id
}

  setFinalVideo(
    card: KistlCard,
    mediaId: string | number,
  ): void {
    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .updateCard(card.id, {
        finalVideo: mediaId,
      })
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.saving.set(false)

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Final Video konnte nicht gesetzt werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }

  // -------------------------
  // Review actions
  // -------------------------
  approveReview(
    card: KistlCard,
  ): void {
    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .updateCard(
        card.id,
        approveReviewPatch(card),
      )
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.saving.set(false)

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Review konnte nicht approved werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }

  declineReview(
    card: KistlCard,
  ): void {
    if (
      !card.review?.comment?.trim()
    ) {
      this.error.set(
        'Bitte Review-Kommentar eingeben.',
      )

      return
    }

    this.error.set('')
    this.saving.set(true)

    this.kistlboard
      .updateCard(
        card.id,
        declineReviewPatch(card),
      )
      .subscribe({
        next: (updatedCard) => {
          this.selectedCard.set(
            prepareCardForEditing(
              mergeUpdatedCardWithCurrentAssets(
                card,
                updatedCard,
              ),
            ),
          )

          this.saving.set(false)

          this.changed$.next()
        },

        error: (error) => {
          console.error(error)

          this.error.set(
            getErrorMessage(
              error,
              'Review konnte nicht declined werden.',
            ),
          )

          this.saving.set(false)
        },
      })
  }


}