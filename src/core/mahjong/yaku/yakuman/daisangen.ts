/**
 * 大三元（ダイサンゲン）
 * 役満 - 鳴きOK
 */

import type { MeldGroup } from '../../types'
import { countDragonTriplets } from '../helpers/meld-checks'

/**
 * 大三元の判定
 * 三元牌の刻子が3組
 */
export function isDaisangen(meldGroup: MeldGroup): boolean {
  return countDragonTriplets(meldGroup) === 3
}
