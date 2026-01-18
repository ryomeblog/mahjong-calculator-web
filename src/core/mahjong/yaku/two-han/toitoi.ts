/**
 * 対々和（トイトイ）
 * 2翻役 - 鳴きOK
 */

import type { MeldGroup } from '../../types'
import { isAllTriplets } from '../helpers/meld-checks'

/**
 * 対々和の判定
 * すべて刻子・槓子
 */
export function isToitoi(meldGroup: MeldGroup): boolean {
  return isAllTriplets(meldGroup)
}
