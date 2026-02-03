/**
 * 九蓮宝燈判定
 */

import type { MeldGroup, Tile } from '../../types'
import { isAllSameSuit } from '../helpers/tile-checks'

/**
 * 九蓮宝燈かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 九蓮宝燈であればtrue
 */
export function isChuuren(meldGroup: MeldGroup): boolean {
  // 門前でない場合は不成立
  if (!meldGroup.melds.every((m) => m.isConcealed)) {
    return false
  }

  // すべて同じ色の数牌
  if (!isAllSameSuit(meldGroup)) {
    return false
  }

  // 手牌を取得（面子+雀頭）
  const allTiles: Tile[] = [
    ...meldGroup.melds.flatMap((m) => [...m.tiles]),
    ...meldGroup.pair.tiles,
  ]

  // 数牌以外が含まれている場合は不成立
  if (allTiles.some((t) => t.type === 'wind' || t.type === 'dragon')) {
    return false
  }

  // 数字のカウント
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // index 0は未使用、1-9が各数字

  for (const tile of allTiles) {
    if ('number' in tile && tile.number) {
      counts[tile.number]++
    }
  }

  // 1112345678999 + 任意の1牌の形かチェック
  // 1が3枚以上、9が3枚以上、2-8が1枚以上
  if (counts[1] < 3 || counts[9] < 3) {
    return false
  }

  for (let i = 2; i <= 8; i++) {
    if (counts[i] < 1) {
      return false
    }
  }

  // 合計が14枚
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (total !== 14) {
    return false
  }

  return true
}

/**
 * 純正九蓮宝燈（9面待ち）かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 純正九蓮宝燈であればtrue
 */
export function isChuuren9(meldGroup: MeldGroup): boolean {
  // 九蓮宝燈であること
  if (!isChuuren(meldGroup)) {
    return false
  }

  // 手牌を取得（面子+雀頭）
  const allTiles: Tile[] = [
    ...meldGroup.melds.flatMap((m) => [...m.tiles]),
    ...meldGroup.pair.tiles,
  ]

  // 数字のカウント
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  for (const tile of allTiles) {
    if ('number' in tile && tile.number) {
      counts[tile.number]++
    }
  }

  // 1が3枚、2-8が1枚ずつ、9が3枚の場合に9面待ち
  if (counts[1] !== 3 || counts[9] !== 3) {
    return false
  }

  for (let i = 2; i <= 8; i++) {
    if (counts[i] !== 1) {
      return false
    }
  }

  return true
}
