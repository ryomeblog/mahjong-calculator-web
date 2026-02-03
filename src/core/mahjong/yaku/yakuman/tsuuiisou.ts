/**
 * 字一色判定
 */

import type { MeldGroup } from '../../types'
import { isAllHonor } from '../helpers/tile-checks'

/**
 * 字一色かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 字一色であればtrue
 */
export function isTsuuiisou(meldGroup: MeldGroup): boolean {
  // すべて字牌
  return isAllHonor(meldGroup)
}
