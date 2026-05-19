import { KistlCard, KistlMedia } from '../models/kistlboard.models'

export const getAssets = (card: KistlCard): KistlMedia[] => {
  const assets = card.assets

  if (!assets) {
    return []
  }

  if (Array.isArray(assets)) {
    return assets
  }

  return assets.docs || []
}

export const getAssetTypeLabel = (asset: KistlMedia): string => {
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

export const formatFileSize = (size?: number): string => {
  if (!size) {
    return ''
  }

  const mb = size / 1024 / 1024

  return `${mb.toFixed(1)} MB`
}

export const mergeUpdatedCardWithCurrentAssets = (
  currentCard: KistlCard,
  updatedCard: KistlCard,
): KistlCard => {
  return {
    ...updatedCard,
    assets: updatedCard.assets ?? currentCard.assets,
  }
}

export const addAssetsToCard = (
  card: KistlCard,
  uploadedMedia: KistlMedia[],
): KistlCard => {
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