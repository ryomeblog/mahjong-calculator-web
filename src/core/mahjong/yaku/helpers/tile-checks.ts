/**
 * 牌チェックヘルパー
 */

import type { Tile, MeldGroup } from '../../types'
import { isTerminalOrHonor, isTerminal, isHonor, isSimple, isAllSameType } from '../../utils/tile-utils'

/**
 * すべての牌（面子+雀頭）を取得
 */
export function getAllTiles(meldGroup: MeldGroup): Tile[] {
  return [
    ...meldGroup.melds.flatMap((m) => [...m.tiles]),
    ...meldGroup.pair.tiles,
  ]
}

/**
 * すべて中張牌（2-8）かどうか
 */
export function isAllSimple(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).every(isSimple)
}

/**
 * すべて么九牌かどうか
 */
export function isAllTerminalOrHonor(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).every(isTerminalOrHonor)
}

/**
 * すべて老頭牌（1,9）かどうか
 */
export function isAllTerminal(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).every(isTerminal)
}

/**
 * すべて字牌かどうか
 */
export function isAllHonor(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).every(isHonor)
}

/**
 * 字牌が含まれているかどうか
 */
export function hasHonor(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).some(isHonor)
}

/**
 * 老頭牌（1,9）が含まれているかどうか
 */
export function hasTerminal(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).some(isTerminal)
}

/**
 * すべて同じ色（萬子、筒子、索子のいずれか1種類）かどうか
 */
export function isAllSameSuit(meldGroup: MeldGroup): boolean {
  return isAllSameType(getAllTiles(meldGroup))
}

/**
 * 緑一色の判定用：緑色の牌かどうか
 */
export function isGreenTile(tile: Tile): boolean {
  // 23468索、發
  if (tile.type === 'sou' && [2, 3, 4, 6, 8].includes(tile.number!)) {
    return true
  }
  if (tile.type === 'dragon' && tile.dragon === 'green') {
    return true
  }
  return false
}

/**
 * すべて緑色の牌かどうか
 */
export function isAllGreen(meldGroup: MeldGroup): boolean {
  return getAllTiles(meldGroup).every(isGreenTile)
}
