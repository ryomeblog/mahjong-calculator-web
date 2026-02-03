/**
 * 四暗刻判定
 */

import type { MeldGroup } from '../../types'
import { countConcealedTriplets } from '../helpers/meld-checks'

/**
 * 四暗刻かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 四暗刻であればtrue
 */
export function isSuuankou(meldGroup: MeldGroup): boolean {
  // 暗刻・暗槓が4つ
  return countConcealedTriplets(meldGroup) === 4
}

/**
 * 四暗刻単騎かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 四暗刻単騎であればtrue
 */
export function isSuuankouTanki(meldGroup: MeldGroup): boolean {
  // 四暗刻であること
  if (!isSuuankou(meldGroup)) {
    return false
  }

  // 単騎待ち
  return meldGroup.wait === 'tanki'
}
