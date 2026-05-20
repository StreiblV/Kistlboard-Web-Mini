import { KistlCard } from '../models/kistlboard.models'
import { calculateWorkflow } from './kistlworkflow'

export interface PreviousStepResult {
  patch: Partial<KistlCard> | null
  error?: string
}

const isPastOrToday = (date?: string): boolean => {
  if (!date) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  return target <= today
}

export const getPreviousStepPatch = (card: KistlCard): PreviousStepResult => {
  const workflow = calculateWorkflow(card)
  const checklist = card.checklist || {}
  const review = card.review || {}

  const isScheduledReady =
    Boolean(checklist.captionWritten) &&
    Boolean(checklist.scheduledPost)

  switch (workflow.column) {
    case 'done':
      if (isScheduledReady && isPastOrToday(card.plannedPostingDate)) {
        return {
          patch: null,
          error:
            'Diese Karte ist bereits nach dem geplanten Postingdatum. Ändere zuerst das geplante Datum, wenn du sie zurücksetzen möchtest.',
        }
      }

      return {
        patch: {
          checklist: {
            ...checklist,
            published: false,
          },
        },
      }

    case 'scheduled':
      return {
        patch: {
          checklist: {
            ...checklist,
            scheduledPost: false,
            published: false,
          },
        },
      }

    case 'content':
      return {
        patch: {
          review: {
            ...review,
            status: 'none',
          },
          checklist: {
            ...checklist,
            captionWritten: false,
            scheduledPost: false,
            published: false,
          },
        },
      }

    case 'review':
      return {
        patch: {
          review: {
            ...review,
            status: 'none',
          },
          checklist: {
            ...checklist,
            finalVideoUploaded: false,
          },
        },
      }

    case 'video-editing':
      return {
        patch: {
          review: {
            ...review,
            status: 'none',
          },
          checklist: {
            ...checklist,

            speedartClip: false,
            revealSequenceEdited: false,
            editFinish: false,
            videoRendered: false,
            finalVideoUploaded: false,

            artwork: false,
          },
        },
      }

    case 'drawing':
      return {
        patch: {
          review: {
            ...review,
            status: 'none',
          },
          checklist: {
            ...checklist,

            workflowStarted: false,

            sketch: false,
            lineart: false,
            colored: false,
            drawing: false,

            drawingClips: false,
            revealClipUploaded: false,
            figure: false,
            artwork: false,

            speedartClip: false,
            revealSequenceEdited: false,
            editFinish: false,
            videoRendered: false,
            finalVideoUploaded: false,

            captionWritten: false,
            scheduledPost: false,
            published: false,
          },
        },
      }

    case 'planning':
    case 'archived':
    default:
      return {
        patch: null,
        error: 'Diese Karte kann nicht weiter zurückgesetzt werden.',
      }
  }
}