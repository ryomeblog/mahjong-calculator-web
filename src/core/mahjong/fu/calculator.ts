/**
 * 符計算メイン処理
 */

import type { MeldGroup, WinningConditions, FuCalculation } from '../types'
import { calculateMeldFu } from './meld-fu'
import { calculatePairFu } from './pair-fu'
import { calculateWaitFu } from './wait-fu'
import { isPinfu } from '../yaku/one-han/pinfu'
import { isAllConcealed } from '../yaku/helpers/meld-checks'

/**
 * 符を計算
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 符計算結果
 */
export function calculateFu(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): FuCalculation {
  // 特殊ケース1: 七対子は25符固定
  if (meldGroup.isSpecial && meldGroup.specialType === 'chiitoitsu') {
    return {
      total: 25,
      breakdown: {
        base: 25,
        melds: 0,
        pair: 0,
        wait: 0,
        tsumo: 0,
        concealed: 0,
      },
    }
  }

  // 特殊ケース2: 平和ツモは20符固定
  if (isPinfu(meldGroup, conditions) && conditions.isTsumo) {
    return {
      total: 20,
      breakdown: {
        base: 20,
        melds: 0,
        pair: 0,
        wait: 0,
        tsumo: 0,
        concealed: 0,
      },
    }
  }

  // 通常の符計算
  const baseFu = 20 // 副底
  const meldsFu = calculateMeldFu(meldGroup.melds)
  const pairFu = calculatePairFu(meldGroup.pair, conditions)
  const waitFu = calculateWaitFu(meldGroup.wait)
  const tsumoFu = conditions.isTsumo ? 2 : 0
  const concealedFu =
    !conditions.isTsumo && isAllConcealed(meldGroup) ? 10 : 0

  let totalFu =
    baseFu + meldsFu + pairFu + waitFu + tsumoFu + concealedFu

  // 切り上げ（10の位）
  totalFu = Math.ceil(totalFu / 10) * 10

  return {
    total: totalFu,
    breakdown: {
      base: baseFu,
      melds: meldsFu,
      pair: pairFu,
      wait: waitFu,
      tsumo: tsumoFu,
      concealed: concealedFu,
    },
  }
}
