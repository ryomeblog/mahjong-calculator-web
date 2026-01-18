/**
 * 標準形分解（4面子1雀頭）
 * 再帰+メモ化による面子分解アルゴリズム
 */

import type { Tile, Meld, Pair, MeldGroup, Sequence, Triplet } from '../types'
import { tilesToCounts, countsToKey, indexToTile } from './tile-converter'
import { detectWaitType } from './wait-detector'

/**
 * メモ化用キャッシュ
 */
type MemoCache = Map<string, Meld[][]>

/**
 * 標準形（4面子1雀頭）に分解
 *
 * @param tiles - 14枚の手牌
 * @param winningTile - 和了牌
 * @returns すべての可能な面子分解
 */
export function decomposeStandard(
  tiles: readonly Tile[],
  winningTile: Tile
): MeldGroup[] {
  if (tiles.length !== 14) {
    throw new Error(`手牌は14枚である必要があります（現在${tiles.length}枚）`)
  }

  const counts = tilesToCounts(tiles)
  const results: MeldGroup[] = []

  // 雀頭候補をすべて試す
  for (let i = 0; i < 34; i++) {
    if (counts[i] < 2) continue

    // 雀頭を抜く
    const pairCounts = [...counts]
    pairCounts[i] -= 2

    const pairTile = indexToTile(i)
    const pair: Pair = {
      type: 'pair',
      tiles: [pairTile, pairTile],
      isConcealed: true,
    }

    // 残りで4面子を探す
    const cache: MemoCache = new Map()
    const meldsList = findMelds(pairCounts, [], cache)

    for (const melds of meldsList) {
      if (melds.length === 4) {
        const wait = detectWaitType(melds, pair, winningTile)

        results.push({
          melds: melds as [Meld, Meld, Meld, Meld],
          pair,
          wait,
          winningTile,
          isSpecial: false,
        })
      }
    }
  }

  return results
}

/**
 * メモ化付き再帰的な面子探索
 *
 * @param counts - 牌のカウント配列
 * @param currentMelds - 現在見つかっている面子
 * @param cache - メモ化キャッシュ
 * @returns 可能なすべての面子の組み合わせ
 */
function findMelds(
  counts: number[],
  currentMelds: Meld[],
  cache: MemoCache
): Meld[][] {
  // メモ化チェック
  const key = countsToKey(counts)
  if (cache.has(key)) {
    const cachedMelds = cache.get(key)!
    // キャッシュされた面子に現在の面子を追加
    return cachedMelds.map((melds) => [...currentMelds, ...melds])
  }

  // ベースケース: すべての牌を使い切った
  if (counts.every((c) => c === 0)) {
    cache.set(key, [[]])
    return [currentMelds]
  }

  // 最初の残牌を見つける
  const idx = counts.findIndex((c) => c > 0)
  if (idx === -1) {
    cache.set(key, [[]])
    return [currentMelds]
  }

  const results: Meld[][] = []

  // 刻子を試す
  if (counts[idx] >= 3) {
    const newCounts = [...counts]
    newCounts[idx] -= 3

    const tile = indexToTile(idx)
    const triplet: Triplet = {
      type: 'triplet',
      tiles: [tile, tile, tile],
      isConcealed: true,
    }

    const subResults = findMelds(newCounts, [...currentMelds, triplet], cache)
    results.push(...subResults)
  }

  // 順子を試す（数牌のみ）
  if (idx < 27 && canMakeSequence(counts, idx)) {
    const newCounts = [...counts]
    newCounts[idx] -= 1
    newCounts[idx + 1] -= 1
    newCounts[idx + 2] -= 1

    const tile1 = indexToTile(idx)
    const tile2 = indexToTile(idx + 1)
    const tile3 = indexToTile(idx + 2)

    const sequence: Sequence = {
      type: 'sequence',
      tiles: [tile1, tile2, tile3],
      isConcealed: true,
    }

    const subResults = findMelds(newCounts, [...currentMelds, sequence], cache)
    results.push(...subResults)
  }

  // メモ化（currentMeldsを除いた部分のみキャッシュ）
  const relativeMelds = results.map((melds) =>
    melds.slice(currentMelds.length)
  )
  cache.set(key, relativeMelds)

  return results
}

/**
 * 順子が作れるかチェック
 *
 * @param counts - 牌のカウント配列
 * @param idx - 開始インデックス
 * @returns 順子が作れるか
 */
function canMakeSequence(counts: number[], idx: number): boolean {
  // 字牌は順子を作れない
  if (idx >= 27) return false

  // 同じ色の中で789以上（8萬、9萬など）は順子の先頭になれない
  const withinSuit = idx % 9
  if (withinSuit > 6) return false

  // 3枚揃っているか
  return counts[idx] > 0 && counts[idx + 1] > 0 && counts[idx + 2] > 0
}
