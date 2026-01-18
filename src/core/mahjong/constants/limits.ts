/**
 * 満貫以上の定数定義
 */

import type { LimitHandName } from '../types'

/**
 * 満貫以上のテーブル
 */
export interface LimitHandDefinition {
  readonly name: LimitHandName
  readonly han: number
  readonly dealerRon: number
  readonly nonDealerRon: number
  readonly dealerTsumoEach: number
  readonly nonDealerTsumoDealer: number
  readonly nonDealerTsumoNonDealer: number
}

/**
 * 満貫以上のテーブル
 */
export const LIMIT_HANDS: readonly LimitHandDefinition[] = [
  {
    name: 'mangan',
    han: 5,
    dealerRon: 12000,
    nonDealerRon: 8000,
    dealerTsumoEach: 4000,
    nonDealerTsumoDealer: 4000,
    nonDealerTsumoNonDealer: 2000,
  },
  {
    name: 'haneman',
    han: 6,
    dealerRon: 18000,
    nonDealerRon: 12000,
    dealerTsumoEach: 6000,
    nonDealerTsumoDealer: 6000,
    nonDealerTsumoNonDealer: 3000,
  },
  {
    name: 'baiman',
    han: 8,
    dealerRon: 24000,
    nonDealerRon: 16000,
    dealerTsumoEach: 8000,
    nonDealerTsumoDealer: 8000,
    nonDealerTsumoNonDealer: 4000,
  },
  {
    name: 'sanbaiman',
    han: 11,
    dealerRon: 36000,
    nonDealerRon: 24000,
    dealerTsumoEach: 12000,
    nonDealerTsumoDealer: 12000,
    nonDealerTsumoNonDealer: 6000,
  },
  {
    name: 'yakuman',
    han: 13,
    dealerRon: 48000,
    nonDealerRon: 32000,
    dealerTsumoEach: 16000,
    nonDealerTsumoDealer: 16000,
    nonDealerTsumoNonDealer: 8000,
  },
  {
    name: 'double-yakuman',
    han: 26,
    dealerRon: 96000,
    nonDealerRon: 64000,
    dealerTsumoEach: 32000,
    nonDealerTsumoDealer: 32000,
    nonDealerTsumoNonDealer: 16000,
  },
  {
    name: 'triple-yakuman',
    han: 39,
    dealerRon: 144000,
    nonDealerRon: 96000,
    dealerTsumoEach: 48000,
    nonDealerTsumoDealer: 48000,
    nonDealerTsumoNonDealer: 24000,
  },
]

/**
 * 満貫の判定条件
 */
export const MANGAN_THRESHOLD = {
  han5: 5, // 5翻以上
  han4fu40: { han: 4, fu: 40 }, // 4翻40符以上
  han3fu70: { han: 3, fu: 70 }, // 3翻70符以上
}
