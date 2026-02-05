/**
 * 面子チェックヘルパー
 */

import type { MeldGroup, Sequence, Triplet, WinningConditions } from '../../types'
import { isSequence, isTriplet, isKong, isDragonTile, isWindTile } from '../../utils/type-guards'
import { isTerminalOrHonor, isSameTile } from '../../utils/tile-utils'

/**
 * すべて順子かどうか
 */
export function isAllSequences(meldGroup: MeldGroup): boolean {
  return meldGroup.melds.every(isSequence)
}

/**
 * すべて刻子・槓子かどうか
 */
export function isAllTriplets(meldGroup: MeldGroup): boolean {
  return meldGroup.melds.every((m) => isTriplet(m) || isKong(m))
}

/**
 * すべて暗刻・暗槓かどうか
 */
export function isAllConcealed(meldGroup: MeldGroup): boolean {
  return meldGroup.melds.every((m) => m.isConcealed)
}

/**
 * 暗刻・暗槓の数を数える
 */
export function countConcealedTriplets(meldGroup: MeldGroup): number {
  return meldGroup.melds.filter(
    (m) => (isTriplet(m) || isKong(m)) && m.isConcealed
  ).length
}

/**
 * ロン和了時の暗刻補正を含む暗刻・暗槓カウント
 * 双碰待ちでロンの場合、和了牌で完成した刻子は明刻として扱う
 */
export function countEffectiveConcealedTriplets(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): number {
  let count = countConcealedTriplets(meldGroup)

  // ロン和了 + 双碰待ちの場合、和了牌で完成した暗刻を1つ減らす
  if (!conditions.isTsumo && meldGroup.wait === 'shanpon') {
    const hasRonTriplet = meldGroup.melds.some(
      (m) =>
        (isTriplet(m) || isKong(m)) &&
        m.isConcealed &&
        m.tiles.some((t) => isSameTile(t, meldGroup.winningTile))
    )
    if (hasRonTriplet) {
      count--
    }
  }

  return count
}

/**
 * 槓子の数を数える
 */
export function countKongs(meldGroup: MeldGroup): number {
  return meldGroup.melds.filter(isKong).length
}

/**
 * すべての面子・雀頭に么九牌が含まれるかどうか
 */
export function allMeldsHaveTerminalOrHonor(meldGroup: MeldGroup): boolean {
  // すべての面子をチェック
  for (const meld of meldGroup.melds) {
    if (!meld.tiles.some(isTerminalOrHonor)) {
      return false
    }
  }

  // 雀頭をチェック
  if (!meldGroup.pair.tiles.some(isTerminalOrHonor)) {
    return false
  }

  return true
}

/**
 * 順子の配列を取得
 */
export function getSequences(meldGroup: MeldGroup): Sequence[] {
  return meldGroup.melds.filter(isSequence) as Sequence[]
}

/**
 * 刻子・槓子の配列を取得
 */
export function getTriplets(meldGroup: MeldGroup): (Triplet | import('../../types').Kong)[] {
  return meldGroup.melds.filter((m) => isTriplet(m) || isKong(m)) as (Triplet | import('../../types').Kong)[]
}

/**
 * 三元牌の刻子・槓子を数える
 */
export function countDragonTriplets(meldGroup: MeldGroup): number {
  return getTriplets(meldGroup).filter((m) => isDragonTile(m.tiles[0])).length
}

/**
 * 風牌の刻子・槓子を数える
 */
export function countWindTriplets(meldGroup: MeldGroup): number {
  return getTriplets(meldGroup).filter((m) => isWindTile(m.tiles[0])).length
}

/**
 * 同じ数字の順子を見つける（三色同順用）
 */
export function findSameNumberSequences(sequences: Sequence[]): Sequence[][] {
  const groups: Map<string, Sequence[]> = new Map()

  for (const seq of sequences) {
    const tile = seq.tiles[0]
    if (tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou') {
      const key = `${tile.number}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(seq)
    }
  }

  return Array.from(groups.values()).filter((group) => group.length >= 3)
}
