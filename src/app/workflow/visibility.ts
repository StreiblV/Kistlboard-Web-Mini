import { KistlCard } from '../models/kistlboard.models'
import { calculateWorkflow } from './kistlworkflow'
import {
  CHECKLIST_GROUPS,
  ChecklistGroup,
} from './kistlchecklist.config'

export const isReviewCard = (
  card: KistlCard,
): boolean => {
  return (
    calculateWorkflow(card).column ===
    'review'
  )
}

export const getVisibleChecklistGroups = (
  card: KistlCard,
): ChecklistGroup[] => {
  const column = calculateWorkflow(card).column

  return CHECKLIST_GROUPS.filter((group) =>
    group.columns.includes(column),
  )
}

export const hasVisibleChecklist = (
  card: KistlCard,
): boolean => {
  return getVisibleChecklistGroups(card).length > 0
}

export const showReviewComments = (
  card: KistlCard,
): boolean => {
  const column = calculateWorkflow(card).column

  return (
    column === 'video-editing' ||
    column === 'review'
  )
}

export const showCaption = (
  card: KistlCard,
): boolean => {
  const column = calculateWorkflow(card).column

  return (
    column === 'review' ||
    column === 'content' ||
    column === 'scheduled' ||
    column === 'done'
  )
}

export const showFinalVideoSelector = (
  card: KistlCard,
): boolean => {
  const column = calculateWorkflow(card).column

  return (
    column === 'video-editing' ||
    column === 'review'
  )
}