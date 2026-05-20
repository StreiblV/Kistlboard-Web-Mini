import { KistlCard } from '../models/kistlboard.models'

export const prepareCardForEditing = (
  card: KistlCard,
): KistlCard => {
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

export const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}