import { KistlCard } from '../models/kistlboard.models'

export const approveReviewPatch = (
  card: KistlCard,
): Partial<KistlCard> => {
  return {
    review: {
      ...(card.review || {}),
      status: 'approved',
      comment:
        card.review?.comment || '',
    },
  }
}

export const declineReviewPatch = (
  card: KistlCard,
): Partial<KistlCard> => {
  return {
    finalVideo: null,

    review: {
      ...(card.review || {}),
      status: 'declined',
      comment:
        card.review?.comment || '',
    },
  }
}