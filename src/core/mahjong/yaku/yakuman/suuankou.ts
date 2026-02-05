/**
 * 四暗刻判定
 */

import type { MeldGroup, WinningConditions } from '../../types'
import { countEffectiveConcealedTriplets } from '../helpers/meld-checks'

/**
 * 四暗刻かどうか判定
 * ロン和了の場合、双碰待ちで完成した刻子は明刻扱いとなるため不成立
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 四暗刻であればtrue
 */
export function isSuuankou(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): boolean {
  return countEffectiveConcealedTriplets(meldGroup, conditions) === 4
}

/**
 * 四暗刻単騎かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 四暗刻単騎であればtrue
 */
export function isSuuankouTanki(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): boolean {
  if (!isSuuankou(meldGroup, conditions)) {
    return false
  }

  // 単騎待ち
  return meldGroup.wait === 'tanki'
}
