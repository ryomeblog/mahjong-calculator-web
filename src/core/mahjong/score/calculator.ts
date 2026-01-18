/**
 * 点数計算メイン処理
 */

import type {
  FuCalculation,
  WinningConditions,
  ScoreCalculation,
} from '../types'
import { getLimitHand } from './limit-hands'
import { calculatePayment } from './payment'
import { LIMIT_HANDS } from '../constants'

/**
 * 点数を計算
 *
 * @param fu - 符計算結果
 * @param han - 翻数
 * @param conditions - 和了条件
 * @returns 点数計算結果
 */
export function calculateScore(
  fu: FuCalculation,
  han: number,
  conditions: WinningConditions
): ScoreCalculation {
  // 満貫以上の判定
  const limitHandName = getLimitHand(han, fu.total)

  if (limitHandName) {
    // 満貫以上の場合、テーブルから点数を取得
    const limitHand = LIMIT_HANDS.find((lh) => lh.name === limitHandName)!

    const payment = conditions.isDealer
      ? conditions.isTsumo
        ? { tsumoEach: limitHand.dealerTsumoEach }
        : { ron: limitHand.dealerRon }
      : conditions.isTsumo
        ? {
            tsumoDealer: limitHand.nonDealerTsumoDealer,
            tsumoNonDealer: limitHand.nonDealerTsumoNonDealer,
          }
        : { ron: limitHand.nonDealerRon }

    return {
      basePoints: fu.total * Math.pow(2, han + 2),
      payment,
      isLimitHand: true,
      limitHandName,
    }
  }

  // 通常計算: 基本点 = 符 × 2^(翻+2)
  const basePoints = fu.total * Math.pow(2, han + 2)

  // 支払い点数を計算
  const payment = calculatePayment(basePoints, conditions)

  return {
    basePoints,
    payment,
    isLimitHand: false,
  }
}
