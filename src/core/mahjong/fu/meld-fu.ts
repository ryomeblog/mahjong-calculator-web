/**
 * 面子の符計算
 */

import type { Meld } from '../types'
import { isTerminalOrHonor } from '../utils/tile-utils'
import { isSequence, isTriplet, isKong } from '../utils/type-guards'

/**
 * 面子の符を計算
 *
 * @param melds - 面子の配列
 * @returns 面子の符の合計
 */
export function calculateMeldFu(melds: readonly Meld[]): number {
  let fu = 0

  for (const meld of melds) {
    // 順子は符なし
    if (isSequence(meld)) {
      continue
    }

    // 刻子
    if (isTriplet(meld)) {
      const tile = meld.tiles[0]
      const isYaochuu = isTerminalOrHonor(tile)

      // 么九牌: 8符/4符、中張牌: 4符/2符
      const baseFu = isYaochuu ? 8 : 4

      // 暗刻なら2倍
      fu += meld.isConcealed ? baseFu : baseFu / 2
    }

    // 槓子
    if (isKong(meld)) {
      const tile = meld.tiles[0]
      const isYaochuu = isTerminalOrHonor(tile)

      // 么九牌: 32符/16符、中張牌: 16符/8符
      const baseFu = isYaochuu ? 32 : 16

      // 暗槓なら2倍
      fu += meld.isConcealed ? baseFu : baseFu / 2
    }
  }

  return fu
}
