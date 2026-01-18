/**
 * 計算結果の型定義
 */

import type { YakuItem } from './yaku'
import type { MeldGroup } from './meld'
import type { WinningConditions } from './conditions'

/**
 * 符の内訳
 */
export interface FuBreakdown {
  /** 副底 */
  readonly base: number

  /** 面子の符 */
  readonly melds: number

  /** 雀頭の符 */
  readonly pair: number

  /** 待ちの符 */
  readonly wait: number

  /** ツモの符 */
  readonly tsumo: number

  /** 門前加符 */
  readonly concealed: number
}

/**
 * 符計算結果
 */
export interface FuCalculation {
  /** 合計符（切り上げ後） */
  readonly total: number

  /** 内訳 */
  readonly breakdown: FuBreakdown
}

/**
 * 翻の内訳
 */
export interface HanBreakdown {
  /** 役の翻 */
  readonly yaku: number

  /** ドラの翻 */
  readonly dora: number

  /** 裏ドラの翻 */
  readonly uraDora: number

  /** 赤ドラの翻 */
  readonly redDora: number
}

/**
 * 翻計算結果
 */
export interface HanCalculation {
  /** 合計翻 */
  readonly total: number

  /** 内訳 */
  readonly breakdown: HanBreakdown
}

/**
 * 支払い点数
 */
export interface Payment {
  /** ロン和了の点数 */
  readonly ron?: number

  /** ツモ和了（親の場合、各子が払う） */
  readonly tsumoEach?: number

  /** ツモ和了（子の場合、親が払う） */
  readonly tsumoDealer?: number

  /** ツモ和了（子の場合、子が払う） */
  readonly tsumoNonDealer?: number
}

/**
 * 満貫以上の名前
 */
export type LimitHandName =
  | 'mangan' // 満貫
  | 'haneman' // 跳満
  | 'baiman' // 倍満
  | 'sanbaiman' // 三倍満
  | 'yakuman' // 役満
  | 'double-yakuman' // ダブル役満
  | 'triple-yakuman' // トリプル役満

/**
 * 点数計算結果
 */
export interface ScoreCalculation {
  /** 基本点 */
  readonly basePoints: number

  /** 支払い点数 */
  readonly payment: Payment

  /** 満貫以上かどうか */
  readonly isLimitHand: boolean

  /** 満貫以上の名前 */
  readonly limitHandName?: LimitHandName
}

/**
 * 最終的な計算結果（すべての情報を含む）
 */
export interface CalculationResult {
  /** 役 */
  readonly yaku: readonly YakuItem[]

  /** 符計算結果 */
  readonly fu: FuCalculation

  /** 翻計算結果 */
  readonly han: HanCalculation

  /** 点数計算結果 */
  readonly score: ScoreCalculation

  /** 面子分解結果 */
  readonly meldGroups: readonly MeldGroup[]

  /** 選択された面子分解（最も高い点数） */
  readonly selectedMeldGroup: MeldGroup

  /** 和了条件 */
  readonly conditions: WinningConditions
}

/**
 * 計算エラー
 */
export interface CalculationError {
  /** エラータイプ */
  readonly type: 'invalid-hand' | 'no-yaku' | 'no-meld' | 'unknown'

  /** エラーメッセージ */
  readonly message: string

  /** エラー詳細 */
  readonly details?: string
}
