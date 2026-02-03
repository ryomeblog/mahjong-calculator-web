/**
 * 清老頭判定
 */

import type { MeldGroup } from '../../types'
import { isAllTerminal } from '../helpers/tile-checks'

/**
 * 清老頭かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 清老頭であればtrue
 */
export function isChinroutou(meldGroup: MeldGroup): boolean {
  // すべて老頭牌（1,9）
  return isAllTerminal(meldGroup)
}
