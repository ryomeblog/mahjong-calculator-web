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
  // 七対子の25符はそのまま使用（30符に変換しない）
  const tablePayment = getPaymentFromTable(han, fu.total, conditions)

  const basePoints = fu.total * Math.pow(2, han + 2)
  const payment = tablePayment ?? calculatePayment(basePoints, conditions)

  return {
    basePoints,
    payment,
    isLimitHand: false,
  }
}

// ルール表に基づく支払い定義
function getPaymentFromTable(
  han: number,
  fu: number,
  conditions: import('../types').WinningConditions
): import('../types').Payment | null {
  const isDealer = conditions.isDealer
  const isTsumo = conditions.isTsumo

  // テーブル（簡易版）: han -> fu -> payment
  // 支払いは ron または tsumo の形で返す
  const dealerTable: Record<
    number,
    Record<number, { ron?: number; tsumoEach?: number }>
  > = {
    1: {
      30: { ron: 1500, tsumoEach: 500 },
      40: { ron: 2000, tsumoEach: 700 },
      50: { ron: 2400, tsumoEach: 800 },
      60: { ron: 2900, tsumoEach: 1000 },
      70: { ron: 3400, tsumoEach: 1200 },
    },
    2: {
      20: { ron: 2000, tsumoEach: 700 },
      25: { ron: 2400, tsumoEach: 800 },
      30: { ron: 2900, tsumoEach: 1000 },
      40: { ron: 3900, tsumoEach: 1300 },
      50: { ron: 4800, tsumoEach: 1600 },
      60: { ron: 5800, tsumoEach: 2000 },
      70: { ron: 6800, tsumoEach: 2300 },
    },
    3: {
      20: { ron: 3900, tsumoEach: 1300 },
      25: { ron: 4800, tsumoEach: 1600 },
      30: { ron: 5800, tsumoEach: 2000 },
      40: { ron: 7700, tsumoEach: 2600 },
      50: { ron: 9600, tsumoEach: 3200 },
      60: { ron: 11600, tsumoEach: 3900 },
    },
    4: {
      20: { ron: 7700, tsumoEach: 2600 },
      25: { ron: 9600, tsumoEach: 3200 },
      30: { ron: 11600, tsumoEach: 3900 },
    },
  }

  const nonDealerTable: Record<
    number,
    Record<
      number,
      { ron?: number; tsumoDealer?: number; tsumoNonDealer?: number }
    >
  > = {
    1: {
      30: { ron: 1000, tsumoDealer: 500, tsumoNonDealer: 300 },
      40: { ron: 1300, tsumoDealer: 700, tsumoNonDealer: 400 },
      50: { ron: 1600, tsumoDealer: 800, tsumoNonDealer: 400 },
      60: { ron: 2000, tsumoDealer: 1000, tsumoNonDealer: 500 },
      70: { ron: 2300, tsumoDealer: 1200, tsumoNonDealer: 600 },
    },
    2: {
      20: { ron: 1300, tsumoDealer: 700, tsumoNonDealer: 300 },
      25: { ron: 1600, tsumoDealer: 800, tsumoNonDealer: 400 },
      30: { ron: 2000, tsumoDealer: 1000, tsumoNonDealer: 500 },
      40: { ron: 2600, tsumoDealer: 1300, tsumoNonDealer: 700 },
      50: { ron: 3200, tsumoDealer: 1600, tsumoNonDealer: 800 },
      60: { ron: 3900, tsumoDealer: 2000, tsumoNonDealer: 1000 },
      70: { ron: 4500, tsumoDealer: 2300, tsumoNonDealer: 1200 },
    },
    3: {
      20: { ron: 2600, tsumoDealer: 1300, tsumoNonDealer: 700 },
      25: { ron: 3200, tsumoDealer: 1600, tsumoNonDealer: 800 },
      30: { ron: 3900, tsumoDealer: 2000, tsumoNonDealer: 1000 },
      40: { ron: 5200, tsumoDealer: 2600, tsumoNonDealer: 1300 },
      50: { ron: 6400, tsumoDealer: 3200, tsumoNonDealer: 1600 },
      60: { ron: 7700, tsumoDealer: 3900, tsumoNonDealer: 2000 },
    },
    4: {
      20: { ron: 5200, tsumoDealer: 2600, tsumoNonDealer: 1300 },
      25: { ron: 6400, tsumoDealer: 3200, tsumoNonDealer: 1600 },
      30: { ron: 7700, tsumoDealer: 3900, tsumoNonDealer: 2000 },
    },
  }

  if (isDealer) {
    const row = dealerTable[han]
    if (!row) return null
    const entry = row[fu]
    if (!entry) return null
    if (isTsumo) {
      return { tsumoEach: entry.tsumoEach! }
    }
    return { ron: entry.ron! }
  } else {
    const row = nonDealerTable[han]
    if (!row) return null
    const entry = row[fu]
    if (!entry) return null
    if (isTsumo) {
      return {
        tsumoDealer: entry.tsumoDealer!,
        tsumoNonDealer: entry.tsumoNonDealer!,
      }
    }
    return { ron: entry.ron! }
  }
}
