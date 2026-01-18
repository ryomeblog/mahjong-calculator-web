/**
 * 牌の操作・比較関数
 */

import type { Tile, TileType } from '../types'

/**
 * 牌が等しいかどうかを判定
 */
export function isSameTile(a: Tile, b: Tile): boolean {
  if (a.type !== b.type) return false

  if (a.type === 'man' || a.type === 'pin' || a.type === 'sou') {
    return a.number === b.number
  }

  if (a.type === 'wind') {
    return a.wind === b.wind
  }

  if (a.type === 'dragon') {
    return a.dragon === b.dragon
  }

  return false
}

/**
 * 牌が么九牌（1, 9, 字牌）かどうかを判定
 */
export function isTerminalOrHonor(tile: Tile): boolean {
  if (tile.type === 'wind' || tile.type === 'dragon') {
    return true
  }

  if (tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou') {
    return tile.number === 1 || tile.number === 9
  }

  return false
}

/**
 * 牌が老頭牌（1, 9）かどうかを判定
 */
export function isTerminal(tile: Tile): boolean {
  if (tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou') {
    return tile.number === 1 || tile.number === 9
  }
  return false
}

/**
 * 牌が字牌かどうかを判定
 */
export function isHonor(tile: Tile): boolean {
  return tile.type === 'wind' || tile.type === 'dragon'
}

/**
 * 牌が中張牌（2-8）かどうかを判定
 */
export function isSimple(tile: Tile): boolean {
  if (tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou') {
    return tile.number !== undefined && tile.number >= 2 && tile.number <= 8
  }
  return false
}

/**
 * 牌の種類が同じかどうかを判定
 */
export function isSameType(a: Tile, b: Tile): boolean {
  return a.type === b.type
}

/**
 * 牌をソート
 * 萬子 → 筒子 → 索子 → 風牌 → 三元牌の順
 */
export function sortTiles(tiles: readonly Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    // 牌の種類順
    const typeOrder: Record<TileType, number> = {
      man: 0,
      pin: 1,
      sou: 2,
      wind: 3,
      dragon: 4,
    }

    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type]
    }

    // 数牌の場合は数字順
    if (a.type === 'man' || a.type === 'pin' || a.type === 'sou') {
      return (a.number || 0) - (b.number || 0)
    }

    // 風牌の場合
    if (a.type === 'wind' && b.type === 'wind') {
      const windOrder = { east: 0, south: 1, west: 2, north: 3 }
      return windOrder[a.wind!] - windOrder[b.wind!]
    }

    // 三元牌の場合
    if (a.type === 'dragon' && b.type === 'dragon') {
      const dragonOrder = { white: 0, green: 1, red: 2 }
      return dragonOrder[a.dragon!] - dragonOrder[b.dragon!]
    }

    return 0
  })
}

/**
 * 牌の配列から重複を除く
 */
export function uniqueTiles(tiles: readonly Tile[]): Tile[] {
  const seen = new Set<string>()
  return tiles.filter((tile) => {
    const key = tileToString(tile)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * 牌を文字列表現に変換
 */
export function tileToString(tile: Tile): string {
  if (tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou') {
    return `${tile.type}-${tile.number}`
  }
  if (tile.type === 'wind') {
    return `wind-${tile.wind}`
  }
  if (tile.type === 'dragon') {
    return `dragon-${tile.dragon}`
  }
  return ''
}

/**
 * すべて同じ色（萬子、筒子、索子のいずれか1種類）かどうかを判定
 */
export function isAllSameType(tiles: readonly Tile[]): boolean {
  if (tiles.length === 0) return false

  const firstType = tiles[0].type

  // 字牌が含まれる場合はfalse
  if (firstType === 'wind' || firstType === 'dragon') return false

  return tiles.every((tile) => tile.type === firstType)
}

/**
 * 字牌が含まれているかどうかを判定
 */
export function hasHonorTile(tiles: readonly Tile[]): boolean {
  return tiles.some((tile) => isHonor(tile))
}

/**
 * 么九牌が含まれているかどうかを判定
 */
export function hasTerminalOrHonor(tiles: readonly Tile[]): boolean {
  return tiles.some((tile) => isTerminalOrHonor(tile))
}

/**
 * すべて么九牌かどうかを判定
 */
export function isAllTerminalOrHonor(tiles: readonly Tile[]): boolean {
  return tiles.every((tile) => isTerminalOrHonor(tile))
}
