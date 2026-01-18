/**
 * 清一色（チンイツ）
 * 6翻役（鳴き5翻） - 鳴きOK
 */

import type { MeldGroup } from '../../types'
import { isAllSameSuit } from '../helpers/tile-checks'

/**
 * 清一色の判定
 * 1種類の数牌のみで和了
 */
export function isChinitsu(meldGroup: MeldGroup): boolean {
  return isAllSameSuit(meldGroup)
}
