/**
 * 支払い計算
 */

import type { Payment, WinningConditions } from '../types'

/**
 * 支払い点数を計算
 *
 * @param basePoints - 基本点
 * @param conditions - 和了条件
 * @returns 支払い点数
 */
export function calculatePayment(
  basePoints: number,
  conditions: WinningConditions
): Payment {
  if (conditions.isDealer) {
    // 親の場合
    if (conditions.isTsumo) {
      // 親のツモ: 子が2倍ずつ払う
      const eachPayment = Math.ceil((basePoints * 2) / 100) * 100
      return { tsumoEach: eachPayment }
    } else {
      // 親のロン: 放銃者が6倍払う
      const ronPayment = Math.ceil((basePoints * 6) / 100) * 100
      return { ron: ronPayment }
    }
  } else {
    // 子の場合
    if (conditions.isTsumo) {
      // 子のツモ: 親が2倍、子が1倍
      const dealerPayment = Math.ceil((basePoints * 2) / 100) * 100
      const nonDealerPayment = Math.ceil(basePoints / 100) * 100
      return {
        tsumoDealer: dealerPayment,
        tsumoNonDealer: nonDealerPayment,
      }
    } else {
      // 子のロン: 放銃者が4倍払う
      const ronPayment = Math.ceil((basePoints * 4) / 100) * 100
      return { ron: ronPayment }
    }
  }
}
