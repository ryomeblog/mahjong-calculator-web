/**
 * 混老頭判定
 */

import type { MeldGroup } from '../../types'
import { isAllTerminalOrHonor } from '../helpers/tile-checks'
import { isAllTriplets } from '../helpers/meld-checks'

/**
 * 混老頭かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 混老頭であればtrue
 */
export function isHonroutou(meldGroup: MeldGroup): boolean {
  // すべて么九牌（老頭牌・字牌）でない場合は不成立
  if (!isAllTerminalOrHonor(meldGroup)) {
    return false
  }

  // すべて刻子・槓子（対々和形）でない場合は不成立
  if (!isAllTriplets(meldGroup)) {
    return false
  }

  return true
}
