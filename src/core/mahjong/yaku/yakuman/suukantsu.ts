/**
 * 四槓子判定
 */

import type { MeldGroup } from '../../types'
import { countKongs } from '../helpers/meld-checks'

/**
 * 四槓子かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 四槓子であればtrue
 */
export function isSuukantsu(meldGroup: MeldGroup): boolean {
  return countKongs(meldGroup) === 4
}
