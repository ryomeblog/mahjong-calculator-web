/**
 * 純全帯么九判定
 */

import type { MeldGroup } from '../../types'
import { allMeldsHaveTerminalOrHonor } from '../helpers/meld-checks'
import { hasHonor, hasTerminal } from '../helpers/tile-checks'
import { isSequence } from '../../utils/type-guards'

/**
 * 純全帯么九かどうか判定
 *
 * @param meldGroup - 面子分解結果
 * @returns 純全帯么九であればtrue
 */
export function isJunchan(meldGroup: MeldGroup): boolean {
  // すべての面子・雀頭に么九牌が含まれていない場合は不成立
  if (!allMeldsHaveTerminalOrHonor(meldGroup)) {
    return false
  }

  // 字牌が含まれている場合は混全帯么九なので不成立
  if (hasHonor(meldGroup)) {
    return false
  }

  // 老頭牌が含まれていない場合は不成立
  if (!hasTerminal(meldGroup)) {
    return false
  }

  // 順子が1つ以上ある必要がある（対々和でない）
  const hasSequence = meldGroup.melds.some(isSequence)
  if (!hasSequence) {
    return false
  }

  return true
}
