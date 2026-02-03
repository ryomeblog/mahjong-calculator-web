/**
 * 三槓子判定
 */

import type { MeldGroup } from '../../types'
import { countKongs } from '../helpers/meld-checks'

/**
 * 三槓子かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 三槓子であればtrue
 */
export function isSankantsu(meldGroup: MeldGroup): boolean {
  return countKongs(meldGroup) === 3
}
