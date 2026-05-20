import { KistlCard, KistlColumn } from '../models/kistlboard.models'

export type ChecklistKey = keyof NonNullable<KistlCard['checklist']>

export interface ChecklistGroup {
  title: string
  columns: KistlColumn[]
  items: {
    key: ChecklistKey
    label: string
  }[]
}

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: 'Artist',
    columns: ['drawing'],
    items: [
      { key: 'sketch', label: 'Sketch Finished' },
      { key: 'lineart', label: 'LineArt Finished' },
      { key: 'colored', label: 'Coloring Finished' },
      { key: 'drawing', label: 'Artwork Finished' },
    ],
  },
  {
    title: 'Artist Uploads',
    columns: ['drawing'],
    items: [
      { key: 'drawingClips', label: 'Drawing Clips Uploaded' },
      { key: 'revealClipUploaded', label: 'Reveal Clip Uploaded' },
      { key: 'figure', label: 'Figure Uploaded' },
      { key: 'artwork', label: 'Artwork Uploaded' },
    ],
  },
  {
    title: 'Video Editing',
    columns: ['video-editing'],
    items: [
      { key: 'speedartClip', label: 'Speedart Sequence Edited' },
      { key: 'revealSequenceEdited', label: 'Reveal Sequence Edited' },
      { key: 'editFinish', label: 'Editing Finished' },
      { key: 'videoRendered', label: 'Video Rendered' },
      { key: 'finalVideoUploaded', label: 'Final Video Uploaded' },
    ],
  },
  {
    title: 'Social',
    columns: ['content', 'scheduled'],
    items: [
      { key: 'captionWritten', label: 'Caption Written' },
      { key: 'scheduledPost', label: 'Post Scheduled' },
      { key: 'published', label: 'Published' },
    ],
  },
]