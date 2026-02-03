/**
 * 小三元判定
 */

import type { MeldGroup } from '../../types'
import { countDragonTriplets } from '../helpers/meld-checks'
import { isDragonTile } from '../../utils/type-guards'

/**
 * 小三元かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 小三元であればtrue
 */
export function isShousangen(meldGroup: MeldGroup): boolean {
  // 三元牌の刻子が2つ
  if (countDragonTriplets(meldGroup) !== 2) {
    return false
  }

  // 雀頭が三元牌
  const pairTile = meldGroup.pair.tiles[0]
  if (!isDragonTile(pairTile)) {
    return false
  }

  return true
}
