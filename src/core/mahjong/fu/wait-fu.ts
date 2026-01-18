/**
 * 待ちの符計算
 */

import type { WaitType } from '../types'

/**
 * 待ちの符を計算
 *
 * 辺張・嵌張・単騎待ちの場合は+2符
 *
 * @param wait - 待ちの形
 * @returns 待ちの符
 */
export function calculateWaitFu(wait: WaitType): number {
  // 辺張・嵌張・単騎は+2符
  if (wait === 'penchan' || wait === 'kanchan' || wait === 'tanki') {
    return 2
  }

  // 両面・双碰・多面待ちは符なし
  return 0
}
