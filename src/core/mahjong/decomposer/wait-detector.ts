/**
 * 待ち判定
 */

import type { Tile, Meld, Pair, WaitType } from '../types'
import { isSameTile } from '../utils/tile-utils'
import { isSequence, isTriplet, isKong } from '../utils/type-guards'

/**
 * 待ちの形を判定
 *
 * @param melds - 4面子
 * @param pair - 雀頭
 * @param winningTile - 和了牌
 * @returns 待ちの形
 */
export function detectWaitType(
  melds: readonly Meld[],
  pair: Pair,
  winningTile: Tile
): WaitType {
  // 単騎待ち（雀頭が和了牌）
  if (isSameTile(pair.tiles[0], winningTile)) {
    return 'tanki'
  }

  // どの面子に和了牌が含まれるか探す
  for (const meld of melds) {
    const hasWinningTile = meld.tiles.some((tile) =>
      isSameTile(tile, winningTile)
    )

    if (!hasWinningTile) continue

    // 刻子・槓子の場合は双碰待ち
    if (isTriplet(meld) || isKong(meld)) {
      return 'shanpon'
    }

    // 順子の場合
    if (isSequence(meld)) {
      const tiles = meld.tiles
      const winIndex = tiles.findIndex((tile) => isSameTile(tile, winningTile))

      if (winIndex === -1) continue

      // 数牌の順子の場合
      if (tiles[0].type === 'man' || tiles[0].type === 'pin' || tiles[0].type === 'sou') {
        const numbers = tiles.map((t) => t.number || 0)

        // 辺張待ち（12 → 3 or 89 → 7）
        if (
          (numbers[0] === 1 && numbers[1] === 2 && winIndex === 2) ||
          (numbers[0] === 7 && numbers[1] === 8 && winIndex === 2)
        ) {
          return 'penchan'
        }

        // 嵌張待ち（13 → 2）
        if (winIndex === 1) {
          return 'kanchan'
        }

        // 両面待ち
        if (winIndex === 0 || winIndex === 2) {
          return 'ryanmen'
        }
      }
    }
  }

  // 判定できない場合は多面待ちとする
  return 'multiple'
}
