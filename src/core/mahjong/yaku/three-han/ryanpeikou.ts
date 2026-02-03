/**
 * 二盃口判定
 */

import type { MeldGroup } from '../../types'
import { getSequences } from '../helpers/meld-checks'

/**
 * 二盃口かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 二盃口であればtrue
 */
export function isRyanpeikou(meldGroup: MeldGroup): boolean {
  // 門前でない場合は不成立
  if (!meldGroup.melds.every((m) => m.isConcealed)) {
    return false
  }

  // 順子のみを取得
  const sequences = getSequences(meldGroup)

  // 順子が4つでない場合は不成立
  if (sequences.length !== 4) {
    return false
  }

  // 同じ順子のペアを2組見つける
  const used = new Set<number>()
  let pairCount = 0

  for (let i = 0; i < sequences.length; i++) {
    if (used.has(i)) continue

    for (let j = i + 1; j < sequences.length; j++) {
      if (used.has(j)) continue

      if (isSameSequence(sequences[i], sequences[j])) {
        used.add(i)
        used.add(j)
        pairCount++
        break
      }
    }
  }

  return pairCount === 2
}

/**
 * 2つの順子が同じかどうか判定
 */
function isSameSequence(
  seq1: import('../../types').Sequence,
  seq2: import('../../types').Sequence
): boolean {
  const tile1 = seq1.tiles[0]
  const tile2 = seq2.tiles[0]

  // 色が異なる場合は不一致
  if (tile1.type !== tile2.type) {
    return false
  }

  // 数牌の場合、数字が一致するか確認
  if (
    (tile1.type === 'man' || tile1.type === 'pin' || tile1.type === 'sou') &&
    (tile2.type === 'man' || tile2.type === 'pin' || tile2.type === 'sou')
  ) {
    return tile1.number === tile2.number
  }

  return false
}
