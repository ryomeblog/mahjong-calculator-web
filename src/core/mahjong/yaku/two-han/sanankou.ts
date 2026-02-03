/**
 * 三暗刻判定
 */

import type { MeldGroup } from '../../types'
import { countConcealedTriplets } from '../helpers/meld-checks'

/**
 * 三暗刻かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 三暗刻であればtrue
 */
export function isSanankou(meldGroup: MeldGroup): boolean {
  return countConcealedTriplets(meldGroup) === 3
}
