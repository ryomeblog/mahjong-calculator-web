/**
 * 三色同刻判定
 */

import type { MeldGroup } from '../../types'
import { getTriplets } from '../helpers/meld-checks'

/**
 * 三色同刻かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 三色同刻であればtrue
 */
export function isSanshokuDoukou(meldGroup: MeldGroup): boolean {
  const triplets = getTriplets(meldGroup)

  // 刻子・槓子が3つ未満の場合は不成立
  if (triplets.length < 3) {
    return false
  }

  // 同じ数字の刻子を探す
  for (let i = 1; i <= 9; i++) {
    const manTriplet = triplets.find(
      (triplet) =>
        triplet.tiles[0].type === 'man' && triplet.tiles[0].number === i
    )
    const pinTriplet = triplets.find(
      (triplet) =>
        triplet.tiles[0].type === 'pin' && triplet.tiles[0].number === i
    )
    const souTriplet = triplets.find(
      (triplet) =>
        triplet.tiles[0].type === 'sou' && triplet.tiles[0].number === i
    )

    if (manTriplet && pinTriplet && souTriplet) {
      return true
    }
  }

  return false
}
