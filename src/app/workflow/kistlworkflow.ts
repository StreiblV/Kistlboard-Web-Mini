import { CalculatedWorkflow, KistlCard, WorkflowStatus } from '../models/kistlboard.models'

const workflowStatusLabels: Record<WorkflowStatus, string> = {
  planning: 'Planning',
  sketching: 'Sketching',
  lineart: 'Lineart',
  coloring: 'Coloring',
  'final-touches': 'Final Touches',
  'upload-pending': 'Upload Pending',
  'sequence-editing': 'Sequence Editing',
  'video-final-touches': 'Final Touches',
  'edit-finished': 'Edit Finished',
  'video-rendered': 'Video Rendered',
  'ready-for-review': 'Ready for Review',
  'need-rework': 'Need Rework',
  'prepare-social-media': 'Prepare Social Media',
  scheduled: 'Scheduled',
  done: 'Done',
  archived: 'Archived',
}

const isDateAfterToday = (date?: string): boolean => {
  if (!date) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  return target < today
}

const hasFinalReviewVideo = (card: KistlCard): boolean => {
  return Boolean(card.finalVideo)
}

export const calculateWorkflow = (card: KistlCard): CalculatedWorkflow => {
  const checklist = card.checklist || {}
  const review = card.review || {}

  const isScheduledReady =
    Boolean(checklist.captionWritten) &&
    Boolean(checklist.scheduledPost)

  const result = (
    column: CalculatedWorkflow['column'],
    workflowStatus: WorkflowStatus,
  ): CalculatedWorkflow => ({
    column,
    workflowStatus,
    statusLabel: workflowStatusLabels[workflowStatus],
  })

  if (card.archived) {
    return result('archived', 'archived')
  }

  if (
    checklist.published ||
    (checklist.scheduledPost && isDateAfterToday(card.plannedPostingDate))
  ) {
    return result('done', 'done')
  }

  if (isScheduledReady) {
    return result('scheduled', 'scheduled')
  }

  if (review.status === 'approved') {
    return result('content', 'prepare-social-media')
  }

  if (review.status === 'declined') {
    return result('video-editing', 'need-rework')
  }

  if (
    checklist.finalVideoUploaded &&
    hasFinalReviewVideo(card)
  ) {
    return result('review', 'ready-for-review')
  }

  if (checklist.videoRendered) {
    return result('video-editing', 'video-rendered')
  }

  if (checklist.editFinish) {
    return result('video-editing', 'edit-finished')
  }

  if (checklist.speedartClip && checklist.revealSequenceEdited) {
    return result('video-editing', 'video-final-touches')
  }

     if (
    checklist.drawing &&
    checklist.drawingClips &&
    checklist.revealClipUploaded &&
    checklist.figure &&
    checklist.artwork
  ) {
    return result('video-editing', 'sequence-editing')
  }

  if (checklist.drawing) {
    return result('drawing', 'upload-pending')
  }

  if (checklist.colored) {
    return result('drawing', 'final-touches')
  }

  if (checklist.lineart) {
    return result('drawing', 'coloring')
  }

  if (checklist.sketch) {
    return result('drawing', 'lineart')
  }

  if (checklist.workflowStarted) {
    return result('drawing', 'sketching')
  }

  return result('planning', 'planning')
}