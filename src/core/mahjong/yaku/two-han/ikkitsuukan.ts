/**
 * 一気通貫判定
 */

import type { MeldGroup, TileType } from '../../types'
import { getSequences } from '../helpers/meld-checks'

/**
 * 一気通貫かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 一気通貫であればtrue
 */
export function isIkkitsuukan(meldGroup: MeldGroup): boolean {
  const sequences = getSequences(meldGroup)

  // 順子が3つ未満の場合は不成立
  if (sequences.length < 3) {
    return false
  }

  // 萬子、筒子、索子それぞれで123・456・789を探す
  const types: TileType[] = ['man', 'pin', 'sou']

  for (const type of types) {
    const typeSequences = sequences.filter((seq) => seq.tiles[0].type === type)

    if (typeSequences.length < 3) {
      continue
    }

    // 123・456・789があるか確認
    const has123 = typeSequences.some(
      (seq) =>
        seq.tiles[0].type === type &&
        'number' in seq.tiles[0] &&
        seq.tiles[0].number === 1
    )
    const has456 = typeSequences.some(
      (seq) =>
        seq.tiles[0].type === type &&
        'number' in seq.tiles[0] &&
        seq.tiles[0].number === 4
    )
    const has789 = typeSequences.some(
      (seq) =>
        seq.tiles[0].type === type &&
        'number' in seq.tiles[0] &&
        seq.tiles[0].number === 7
    )

    if (has123 && has456 && has789) {
      return true
    }
  }

  return false
}
