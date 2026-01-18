/**
 * 牌の型定義
 */

/**
 * 牌の種類
 */
export type TileType = 'man' | 'pin' | 'sou' | 'wind' | 'dragon'

/**
 * 牌の数字（1-9）
 * 数牌（萬子・筒子・索子）で使用
 */
export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/**
 * 風牌の種類
 */
export type Wind = 'east' | 'south' | 'west' | 'north'

/**
 * 三元牌の種類
 */
export type Dragon = 'white' | 'green' | 'red'

/**
 * 牌を表す型
 */
export interface Tile {
  /** 牌の種類 */
  readonly type: TileType

  /** 数字（数牌の場合のみ） */
  readonly number?: TileNumber

  /** 風牌の値（風牌の場合のみ） */
  readonly wind?: Wind

  /** 三元牌の値（三元牌の場合のみ） */
  readonly dragon?: Dragon

  /** 赤ドラかどうか */
  readonly isRed?: boolean
}

/**
 * 数牌（萬子・筒子・索子）
 */
export interface NumberTile extends Tile {
  readonly type: 'man' | 'pin' | 'sou'
  readonly number: TileNumber
}

/**
 * 字牌（風牌・三元牌）
 */
export type HonorTile = WindTile | DragonTile

/**
 * 風牌
 */
export interface WindTile extends Tile {
  readonly type: 'wind'
  readonly wind: Wind
}

/**
 * 三元牌
 */
export interface DragonTile extends Tile {
  readonly type: 'dragon'
  readonly dragon: Dragon
}

/**
 * 么九牌判定のヘルパー型
 * 1, 9, 字牌
 */
export type TerminalTile = NumberTile & { readonly number: 1 | 9 }

/**
 * 中張牌（2-8）
 */
export type SimpleTile = NumberTile & {
  readonly number: 2 | 3 | 4 | 5 | 6 | 7 | 8
}
