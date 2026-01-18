/**
 * 和了条件の型定義
 */

import type { Wind } from './tile'

/**
 * 和了条件
 */
export interface WinningConditions {
  /** ツモ和了かロン和了か */
  readonly isTsumo: boolean

  /** 立直 */
  readonly isRiichi: boolean

  /** ダブル立直 */
  readonly isDoubleRiichi: boolean

  /** 一発 */
  readonly isIppatsu: boolean

  /** 海底撈月 */
  readonly isHaitei: boolean

  /** 河底撈魚 */
  readonly isHoutei: boolean

  /** 嶺上開花 */
  readonly isRinshan: boolean

  /** 槍槓 */
  readonly isChankan: boolean

  /** 天和 */
  readonly isTenhou: boolean

  /** 地和 */
  readonly isChiihou: boolean

  /** 場風 */
  readonly prevailingWind: Wind

  /** 自風 */
  readonly seatWind: Wind

  /** 親かどうか */
  readonly isDealer: boolean

  /** ドラ枚数 */
  readonly doraCount: number

  /** 裏ドラ枚数 */
  readonly uraDoraCount: number

  /** 赤ドラ枚数 */
  readonly redDoraCount: number
}

/**
 * 和了方法
 */
export type WinMethod = 'tsumo' | 'ron'

/**
 * 局の情報
 */
export interface RoundInfo {
  /** 場風 */
  readonly prevailingWind: Wind

  /** 自風 */
  readonly seatWind: Wind

  /** 本場 */
  readonly honba: number

  /** 供託棒 */
  readonly riichiSticks: number
}
