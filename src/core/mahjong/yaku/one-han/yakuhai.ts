/**
 * 役牌判定
 */

import type { MeldGroup, WinningConditions, Wind } from '../../types'
import { getTriplets } from '../helpers/meld-checks'
import { isWindTile, isDragonTile } from '../../utils/type-guards'

/**
 * 役牌（風牌）があるか判定
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 役牌の風牌の数
 */
export function countYakuhaiWind(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): number {
  const triplets = getTriplets(meldGroup)
  let count = 0

  for (const triplet of triplets) {
    const tile = triplet.tiles[0]
    if (isWindTile(tile)) {
      const wind = tile.wind as Wind
      // 場風または自風の場合
      if (wind === conditions.prevailingWind || wind === conditions.seatWind) {
        count++
        // 場風と自風が重なる場合は2翻
        if (
          wind === conditions.prevailingWind &&
          wind === conditions.seatWind
        ) {
          count++
        }
      }
    }
  }

  return count
}

/**
 * 役牌（三元牌）があるか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 役牌の三元牌の数
 */
export function countYakuhaiDragon(meldGroup: MeldGroup): number {
  const triplets = getTriplets(meldGroup)
  let count = 0

  for (const triplet of triplets) {
    const tile = triplet.tiles[0]
    if (isDragonTile(tile)) {
      count++
    }
  }

  return count
}

/**
 * 雀頭が役牌（風牌）かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 雀頭が役牌の風牌であればtrue
 */
export function isPairYakuhaiWind(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): boolean {
  const pairTile = meldGroup.pair.tiles[0]
  if (isWindTile(pairTile)) {
    const wind = pairTile.wind as Wind
    return wind === conditions.prevailingWind || wind === conditions.seatWind
  }
  return false
}

/**
 * 雀頭が役牌（三元牌）かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 雀頭が役牌の三元牌であればtrue
 */
export function isPairYakuhaiDragon(meldGroup: MeldGroup): boolean {
  const pairTile = meldGroup.pair.tiles[0]
  return isDragonTile(pairTile)
}
