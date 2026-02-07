/**
 * 満貫以上の判定
 */

import type { LimitHandName } from '../types'

/**
 * 満貫以上の判定
 *
 * @param han - 翻数
 * @param fu - 符数
 * @returns 満貫以上の名前、またはnull
 */
export function getLimitHand(han: number, fu: number): LimitHandName | null {
  // 役満以上
  if (han >= 39) return 'triple-yakuman'
  if (han >= 26) return 'double-yakuman'
  if (han >= 13) return 'yakuman'

  // 三倍満
  if (han >= 11) return 'sanbaiman'

  // 倍満
  if (han >= 8) return 'baiman'

  // 跳満
  if (han >= 6) return 'haneman'

  // 満貫
  if (han >= 5) return 'mangan'
  if (han === 4 && fu >= 40) return 'mangan'
  // ルール表に合わせ、3翻は60符以上で満貫扱い
  if (han === 3 && fu >= 60) return 'mangan'

  return null
}

// NOTE: MANGAN_THRESHOLD は参照用に残しておく
export const MANGAN_THRESHOLD = {
  han5: 5,
  han4fu40: { han: 4, fu: 40 },
  han3fu60: { han: 3, fu: 60 },
}
