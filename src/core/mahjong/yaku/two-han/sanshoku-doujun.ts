/**
 * 三色同順判定
 */

import type { MeldGroup } from '../../types'
import { getSequences } from '../helpers/meld-checks'

/**
 * 三色同順かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 三色同順であればtrue
 */
export function isSanshokuDoujun(meldGroup: MeldGroup): boolean {
  const sequences = getSequences(meldGroup)

  // 順子が3つ未満の場合は不成立
  if (sequences.length < 3) {
    return false
  }

  // 同じ数字の順子を探す
  for (let i = 1; i <= 7; i++) {
    const manSeq = sequences.find(
      (seq) => seq.tiles[0].type === 'man' && seq.tiles[0].number === i
    )
    const pinSeq = sequences.find(
      (seq) => seq.tiles[0].type === 'pin' && seq.tiles[0].number === i
    )
    const souSeq = sequences.find(
      (seq) => seq.tiles[0].type === 'sou' && seq.tiles[0].number === i
    )

    if (manSeq && pinSeq && souSeq) {
      return true
    }
  }

  return false
}
