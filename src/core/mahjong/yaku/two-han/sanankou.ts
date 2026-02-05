/**
 * 三暗刻判定
 */

import type { MeldGroup, WinningConditions } from '../../types'
import { countEffectiveConcealedTriplets } from '../helpers/meld-checks'

/**
 * 三暗刻かどうか判定
 * ロン和了の場合、双碰待ちで完成した刻子は明刻扱い
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 三暗刻であればtrue
 */
export function isSanankou(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): boolean {
  return countEffectiveConcealedTriplets(meldGroup, conditions) === 3
}
