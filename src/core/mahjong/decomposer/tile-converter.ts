/**
 * Tile ⇔ インデックス変換
 */

import type { Tile } from '../types'
import { ALL_TILES } from '../constants'

/**
 * Tileを0-33のインデックスに変換
 *
 * インデックスマッピング:
 * 0-8: 一萬〜九萬
 * 9-17: 一筒〜九筒
 * 18-26: 一索〜九索
 * 27-30: 東南西北
 * 31-33: 白發中
 */
export function tileToIndex(tile: Tile): number {
  if (tile.type === 'man') {
    return (tile.number || 1) - 1
  }

  if (tile.type === 'pin') {
    return 9 + (tile.number || 1) - 1
  }

  if (tile.type === 'sou') {
    return 18 + (tile.number || 1) - 1
  }

  if (tile.type === 'wind') {
    const windMap = { east: 27, south: 28, west: 29, north: 30 }
    return windMap[tile.wind!]
  }

  if (tile.type === 'dragon') {
    const dragonMap = { white: 31, green: 32, red: 33 }
    return dragonMap[tile.dragon!]
  }

  throw new Error(`Invalid tile: ${JSON.stringify(tile)}`)
}

/**
 * インデックスをTileに変換
 */
export function indexToTile(index: number): Tile {
  if (index < 0 || index > 33) {
    throw new Error(`Invalid index: ${index}`)
  }

  return ALL_TILES[index]
}

/**
 * Tile配列をカウント配列に変換
 *
 * @param tiles - 牌の配列
 * @returns カウント配列（34要素、各要素は0-4）
 */
export function tilesToCounts(tiles: readonly Tile[]): number[] {
  const counts = new Array(34).fill(0)

  for (const tile of tiles) {
    const index = tileToIndex(tile)
    counts[index]++

    if (counts[index] > 4) {
      throw new Error(
        `Too many tiles of the same type: ${JSON.stringify(tile)}`
      )
    }
  }

  return counts
}

/**
 * カウント配列をTile配列に変換
 */
export function countsToTiles(counts: readonly number[]): Tile[] {
  const tiles: Tile[] = []

  for (let i = 0; i < counts.length; i++) {
    for (let j = 0; j < counts[i]; j++) {
      tiles.push(indexToTile(i))
    }
  }

  return tiles
}

/**
 * カウント配列を文字列キーに変換（メモ化用）
 */
export function countsToKey(counts: readonly number[]): string {
  return counts.join(',')
}
