/**
 * UI用の型定義
 */

import type { Tile, Wind } from '@/core/mahjong'

/**
 * 牌の選択状態
 */
export interface TileSelection {
  readonly tile: Tile
  readonly count: number
}

/**
 * 手牌の状態
 */
export interface HandState {
  readonly tiles: readonly Tile[]
  readonly meldedTiles: readonly Tile[][]
  readonly winningTile: Tile | null
}

/**
 * 和了条件の入力状態
 */
export interface WinConditionsInput {
  readonly isTsumo: boolean
  readonly isRiichi: boolean
  readonly isDoubleRiichi: boolean
  readonly isIppatsu: boolean
  readonly isChankan: boolean
  readonly isRinshan: boolean
  readonly isHaitei: boolean
  readonly isHoutei: boolean
  readonly isTenhou: boolean
  readonly isChiihou: boolean
  readonly roundWind: Wind
  readonly seatWind: Wind
  readonly isDealer: boolean
  readonly doraTiles: readonly Tile[]
  readonly uraDoraTiles: readonly Tile[]
  readonly honba: number
}

/**
 * タブの種類
 */
export type TileTab = 'man' | 'pin' | 'sou' | 'honor'

/**
 * 牌の種類ごとのラベル
 */
export const TILE_TAB_LABELS: Record<TileTab, string> = {
  man: '萬子（マンズ）',
  pin: '筒子（ピンズ）',
  sou: '索子（ソーズ）',
  honor: '字牌',
}

/**
 * 風牌のラベル
 */
export const WIND_LABELS: Record<Wind, string> = {
  east: '東',
  south: '南',
  west: '西',
  north: '北',
}
