/**
 * 特殊形判定（国士無双・七対子）
 */

import type { Tile, SpecialForm } from '../types'
import { isTerminalOrHonor } from '../utils/tile-utils'
import { tilesToCounts } from './tile-converter'

/**
 * 国士無双を判定
 *
 * 13種類の么九牌を1枚ずつと、いずれか1種の対子
 *
 * @param tiles - 14枚の手牌
 * @param winningTile - 和了牌
 * @returns 国士無双の形、または null
 */
export function detectKokushi(
  tiles: readonly Tile[],
  winningTile: Tile
): SpecialForm | null {
  // すべての牌が么九牌かチェック
  if (!tiles.every(isTerminalOrHonor)) {
    return null
  }

  const counts = tilesToCounts(tiles)

  // 么九牌のインデックス（13種類）
  const yaochuuIndices = [
    0, 8, // 一萬、九萬
    9, 17, // 一筒、九筒
    18, 26, // 一索、九索
    27, 28, 29, 30, // 東南西北
    31, 32, 33, // 白發中
  ]

  // 13種類すべてが含まれているかチェック
  const yaochuuCounts = yaochuuIndices.map((i) => counts[i])
  const uniqueCount = yaochuuCounts.filter((c) => c > 0).length

  if (uniqueCount !== 13) {
    return null
  }

  // 1つだけ2枚ある（対子）
  const pairCount = yaochuuCounts.filter((c) => c === 2).length
  if (pairCount !== 1) {
    return null
  }

  return {
    type: 'kokushi',
    tiles,
    winningTile,
  }
}

/**
 * 七対子を判定
 *
 * 7種類の対子
 *
 * @param tiles - 14枚の手牌
 * @param winningTile - 和了牌
 * @returns 七対子の形、または null
 */
export function detectChiitoitsu(
  tiles: readonly Tile[],
  winningTile: Tile
): SpecialForm | null {
  const counts = tilesToCounts(tiles)

  // すべて2枚ずつ（7組）
  const pairCount = counts.filter((c) => c === 2).length
  const otherCount = counts.filter((c) => c !== 0 && c !== 2).length

  if (pairCount !== 7 || otherCount !== 0) {
    return null
  }

  return {
    type: 'chiitoitsu',
    tiles,
    winningTile,
  }
}

/**
 * 特殊形を判定（国士無双または七対子）
 *
 * @param tiles - 14枚の手牌
 * @param winningTile - 和了牌
 * @returns 特殊形の配列
 */
export function detectSpecialForms(
  tiles: readonly Tile[],
  winningTile: Tile
): SpecialForm[] {
  const results: SpecialForm[] = []

  const kokushi = detectKokushi(tiles, winningTile)
  if (kokushi) {
    results.push(kokushi)
  }

  const chiitoitsu = detectChiitoitsu(tiles, winningTile)
  if (chiitoitsu) {
    results.push(chiitoitsu)
  }

  return results
}
