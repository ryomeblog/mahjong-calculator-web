/**
 * 面子の型定義
 */

import type { Tile } from './tile'

/**
 * 面子の種類
 */
export type MeldType = 'sequence' | 'triplet' | 'kong' | 'pair'

/**
 * 面子の基本型
 */
export interface Meld {
  /** 面子の種類 */
  readonly type: MeldType

  /** 構成する牌 */
  readonly tiles: readonly Tile[]

  /** 暗刻/暗槓かどうか */
  readonly isConcealed: boolean
}

/**
 * 順子（シュンツ）
 * 例: 123萬, 567筒
 */
export interface Sequence extends Meld {
  readonly type: 'sequence'
  readonly tiles: readonly [Tile, Tile, Tile]
  readonly isConcealed: true // 順子は常に暗
}

/**
 * 刻子（コーツ）
 * 例: 111萬, 東東東
 */
export interface Triplet extends Meld {
  readonly type: 'triplet'
  readonly tiles: readonly [Tile, Tile, Tile]
  readonly isConcealed: boolean
}

/**
 * 槓子（カンツ）
 * 例: 1111萬, 東東東東
 */
export interface Kong extends Meld {
  readonly type: 'kong'
  readonly tiles: readonly [Tile, Tile, Tile, Tile]
  readonly isConcealed: boolean
}

/**
 * 雀頭（ジャントウ）
 * 例: 11萬, 東東
 */
export interface Pair extends Meld {
  readonly type: 'pair'
  readonly tiles: readonly [Tile, Tile]
  readonly isConcealed: true // 雀頭は常に暗
}

/**
 * 待ちの形
 */
export type WaitType =
  | 'ryanmen' // 両面待ち（23 → 14）
  | 'kanchan' // 嵌張待ち（13 → 2）
  | 'penchan' // 辺張待ち（12 → 3 or 89 → 7）
  | 'shanpon' // 双碰待ち（11 + 22 → 1 or 2）
  | 'tanki' // 単騎待ち（1 → 1）
  | 'multiple' // 多面待ち

/**
 * 面子構成（4面子1雀頭）
 */
export interface MeldGroup {
  /** 面子（4つ） */
  readonly melds: readonly [Meld, Meld, Meld, Meld]

  /** 雀頭（1つ） */
  readonly pair: Pair

  /** 待ちの形 */
  readonly wait: WaitType

  /** 和了牌 */
  readonly winningTile: Tile

  /** 特殊形かどうか */
  readonly isSpecial: boolean

  /** 特殊形の種類（特殊形の場合のみ） */
  readonly specialType?: SpecialFormType
}

/**
 * 特殊形の種類
 */
export type SpecialFormType = 'kokushi' | 'chiitoitsu'

/**
 * 特殊形
 */
export interface SpecialForm {
  readonly type: SpecialFormType
  readonly tiles: readonly Tile[]
  readonly winningTile: Tile
}
