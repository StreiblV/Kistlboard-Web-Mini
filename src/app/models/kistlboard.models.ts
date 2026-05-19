export type KistlColumn =
  | 'planning'
  | 'drawing'
  | 'video-editing'
  | 'review'
  | 'content'
  | 'scheduled'
  | 'done'
  | 'archived'

export type WorkflowStatus =
  | 'planning'
  | 'sketching'
  | 'lineart'
  | 'coloring'
  | 'final-touches'
  | 'upload-pending'
  | 'sequence-editing'
  | 'video-final-touches'
  | 'edit-finished'
  | 'video-rendered'
  | 'ready-for-review'
  | 'need-rework'
  | 'prepare-social-media'
  | 'scheduled'
  | 'done'
  | 'archived'

export type ReviewStatus = 'none' | 'approved' | 'declined'

export interface PayloadListResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page?: number
  hasPrevPage?: boolean
  hasNextPage?: boolean
  prevPage?: number | null
  nextPage?: number | null
}

export interface PayloadJoinResponse<T> {
  docs: T[]
  totalDocs?: number
  limit?: number
  totalPages?: number
  page?: number
}

export interface KistlChecklist {
  workflowStarted?: boolean

  sketch?: boolean
  lineart?: boolean
  colored?: boolean
  drawing?: boolean

  drawingClips?: boolean
  revealClipUploaded?: boolean
  figure?: boolean
  artwork?: boolean
  finalVideoUploaded?: boolean

  speedartClip?: boolean
  revealSequenceEdited?: boolean
  editFinish?: boolean
  videoRendered?: boolean

  captionWritten?: boolean
  scheduledPost?: boolean
  published?: boolean
}

export interface KistlReview {
  status?: ReviewStatus
  comment?: string
}

export interface KistlMedia {
  id: string | number
  filename?: string
  url?: string
  mimeType?: string
  filesize?: number
  assetType?: 'artwork' | 'figure' | 'drawing-clip' | 'reveal-clip' | 'final-video' | 'other'
  alt?: string
  notes?: string
}

export interface KistlCard {
  id: string | number
  name: string
  plannedPostingDate?: string
  part?: string
  emojiHints?: string
  gifWish?: string
  textWishes?: string
  finalVideo?: string | number | KistlMedia | null
  assets?: PayloadJoinResponse<KistlMedia> | KistlMedia[]
  checklist?: KistlChecklist
  review: KistlReview
  caption?: string
  archived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CalculatedWorkflow {
  column: KistlColumn
  workflowStatus: WorkflowStatus
  statusLabel: string
}