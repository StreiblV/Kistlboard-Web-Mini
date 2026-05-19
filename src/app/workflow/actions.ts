import { KistlCard } from '../models/kistlboard.models'
import { calculateWorkflow } from './kistlworkflow'

export const isPlanningCard = (
  card: KistlCard,
): boolean => {
  return calculateWorkflow(card).column === 'planning'
}