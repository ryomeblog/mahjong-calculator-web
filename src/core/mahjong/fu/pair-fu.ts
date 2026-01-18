/**
 * 雀頭の符計算
 */

import type { Pair, WinningConditions } from '../types'
import { isWindTile, isDragonTile } from '../utils/type-guards'

/**
 * 雀頭の符を計算
 *
 * 役牌（自風・場風・三元牌）の場合は+2符
 *
 * @param pair - 雀頭
 * @param conditions - 和了条件
 * @returns 雀頭の符
 */
export function calculatePairFu(
  pair: Pair,
  conditions: WinningConditions
): number {
  const tile = pair.tiles[0]

  // 三元牌は常に役牌
  if (isDragonTile(tile)) {
    return 2
  }

  // 風牌で、自風または場風なら役牌
  if (isWindTile(tile)) {
    if (
      tile.wind === conditions.seatWind ||
      tile.wind === conditions.prevailingWind
    ) {
      return 2
    }
  }

  return 0
}
