/**
 * 平和（ピンフ）
 * 1翻役 - 門前のみ
 */

import type { MeldGroup, WinningConditions } from '../../types'
import { isAllSequences, isAllConcealed } from '../helpers/meld-checks'
import { isWindTile, isDragonTile } from '../../utils/type-guards'

/**
 * 平和の判定
 * - 門前
 * - すべて順子
 * - 両面待ち
 * - 雀頭が役牌でない
 */
export function isPinfu(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): boolean {
  // 門前かどうか
  if (!isAllConcealed(meldGroup)) {
    return false
  }

  // すべて順子かどうか
  if (!isAllSequences(meldGroup)) {
    return false
  }

  // 両面待ちかどうか
  if (meldGroup.wait !== 'ryanmen') {
    return false
  }

  // 雀頭が役牌でないかどうか
  const pairTile = meldGroup.pair.tiles[0]

  // 風牌の場合、自風または場風なら役牌
  if (isWindTile(pairTile)) {
    if (
      pairTile.wind === conditions.seatWind ||
      pairTile.wind === conditions.prevailingWind
    ) {
      return false
    }
  }

  // 三元牌の場合は役牌
  if (isDragonTile(pairTile)) {
    return false
  }

  return true
}
