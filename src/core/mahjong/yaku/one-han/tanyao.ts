/**
 * 断么九（タンヤオ）
 * 1翻役 - 鳴きOK
 */

import type { MeldGroup } from '../../types'
import { isAllSimple } from '../helpers/tile-checks'

/**
 * 断么九の判定
 * すべての牌が中張牌（2-8）
 */
export function isTanyao(meldGroup: MeldGroup): boolean {
  return isAllSimple(meldGroup)
}
