/**
 * 混一色判定
 */

import type { MeldGroup, TileType } from '../../types'
import { getAllTiles } from '../helpers/tile-checks'

/**
 * 混一色かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 混一色であればtrue
 */
export function isHonitsu(meldGroup: MeldGroup): boolean {
  const allTiles = getAllTiles(meldGroup)

  // 数牌と字牌の種類を確認
  const suitTypes = new Set<TileType>()
  let hasHonor = false

  for (const tile of allTiles) {
    if (tile.type === 'wind' || tile.type === 'dragon') {
      hasHonor = true
    } else {
      suitTypes.add(tile.type)
    }
  }

  // 数牌が1種類で、字牌が含まれている場合に混一色
  return suitTypes.size === 1 && hasHonor
}
