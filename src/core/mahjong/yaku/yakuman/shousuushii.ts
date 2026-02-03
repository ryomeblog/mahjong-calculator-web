/**
 * 小四喜・大四喜判定
 */

import type { MeldGroup } from '../../types'
import { countWindTriplets } from '../helpers/meld-checks'
import { isWindTile } from '../../utils/type-guards'

/**
 * 小四喜かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 小四喜であればtrue
 */
export function isShousuushii(meldGroup: MeldGroup): boolean {
  // 風牌の刻子が3つ
  if (countWindTriplets(meldGroup) !== 3) {
    return false
  }

  // 雀頭が風牌
  const pairTile = meldGroup.pair.tiles[0]
  if (!isWindTile(pairTile)) {
    return false
  }

  return true
}

/**
 * 大四喜かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 大四喜であればtrue
 */
export function isDaisuushii(meldGroup: MeldGroup): boolean {
  // 風牌の刻子が4つ
  return countWindTriplets(meldGroup) === 4
}
