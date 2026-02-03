/**
 * 一盃口判定
 */

import type { MeldGroup } from '../../types'
import { getSequences } from '../helpers/meld-checks'

/**
 * 一盃口かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 一盃口であればtrue
 */
export function isIipeikou(meldGroup: MeldGroup): boolean {
  // 門前でない場合は不成立
  if (!meldGroup.melds.every((m) => m.isConcealed)) {
    return false
  }

  // 順子のみを取得
  const sequences = getSequences(meldGroup)

  // 順子が2つ未満の場合は不成立
  if (sequences.length < 2) {
    return false
  }

  // 同じ順子のペアを探す
  for (let i = 0; i < sequences.length; i++) {
    for (let j = i + 1; j < sequences.length; j++) {
      if (isSameSequence(sequences[i], sequences[j])) {
        return true
      }
    }
  }

  return false
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
