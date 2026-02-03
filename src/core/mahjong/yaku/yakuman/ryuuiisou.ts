/**
 * 緑一色判定
 */

import type { MeldGroup } from '../../types'
import { isAllGreen } from '../helpers/tile-checks'

/**
 * 緑一色かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 緑一色であればtrue
 */
export function isRyuuiisou(meldGroup: MeldGroup): boolean {
  // すべて緑色の牌（23468索、發）
  return isAllGreen(meldGroup)
}
