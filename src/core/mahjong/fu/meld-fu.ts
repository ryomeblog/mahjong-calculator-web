/**
 * 面子の符計算
 */

import type { Meld, Tile, WaitType } from '../types'
import { isTerminalOrHonor, isSameTile } from '../utils/tile-utils'
import { isSequence, isTriplet, isKong } from '../utils/type-guards'

/**
 * 面子の符を計算
 *
 * @param melds - 面子の配列
 * @param ronTripletTile - ロン+双碰待ちの場合、和了牌（この牌を含む刻子は明刻扱い）
 * @returns 面子の符の合計
 */
export function calculateMeldFu(
  melds: readonly Meld[],
  ronTripletTile?: Tile
): number {
  let fu = 0
  let ronTripletHandled = false

  for (const meld of melds) {
    // 順子は符なし
    if (isSequence(meld)) {
      continue
    }

    // ロン+双碰待ちで和了牌を含む暗刻は明刻として符計算
    let effectiveConcealed = meld.isConcealed
    if (
      effectiveConcealed &&
      !ronTripletHandled &&
      ronTripletTile &&
      (isTriplet(meld) || isKong(meld)) &&
      meld.tiles.some((t) => isSameTile(t, ronTripletTile))
    ) {
      effectiveConcealed = false
      ronTripletHandled = true
    }

    // 刻子
    if (isTriplet(meld)) {
      const tile = meld.tiles[0]
      const isYaochuu = isTerminalOrHonor(tile)

      // 么九牌: 8符/4符、中張牌: 4符/2符
      const baseFu = isYaochuu ? 8 : 4

      // 暗刻なら2倍
      fu += effectiveConcealed ? baseFu : baseFu / 2
    }

    // 槓子
    if (isKong(meld)) {
      const tile = meld.tiles[0]
      const isYaochuu = isTerminalOrHonor(tile)

      // 么九牌: 32符/16符、中張牌: 16符/8符
      const baseFu = isYaochuu ? 32 : 16

      // 暗槓なら2倍
      fu += effectiveConcealed ? baseFu : baseFu / 2
    }
  }

  return fu
}

/**
 * ロン+双碰待ちの場合の和了牌を取得
 */
export function getRonTripletTile(
  isTsumo: boolean,
  wait: WaitType,
  winningTile: Tile
): Tile | undefined {
  if (!isTsumo && wait === 'shanpon') {
    return winningTile
  }
  return undefined
}
