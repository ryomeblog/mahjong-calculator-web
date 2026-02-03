/**
 * 牌関連のユーティリティ関数
 */

import type { Tile } from '@/core/mahjong'

/**
 * 赤ドラを区別する牌比較
 */
export function isSameTile(a: Tile, b: Tile): boolean {
  if (a.type !== b.type) return false
  if (a.type === 'man' || a.type === 'pin' || a.type === 'sou') {
    return a.number === b.number && a.isRed === b.isRed
  }
  if (a.type === 'wind') return a.wind === b.wind
  if (a.type === 'dragon') return a.dragon === b.dragon
  return false
}
