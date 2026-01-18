/**
 * 牌の定数定義
 */

import type { Tile } from '../types'

/**
 * 牌のインデックスマッピング（0-33）
 *
 * 0-8: 一萬〜九萬
 * 9-17: 一筒〜九筒
 * 18-26: 一索〜九索
 * 27-30: 東南西北
 * 31-33: 白發中
 */

/**
 * すべての牌の配列（34種類）
 */
export const ALL_TILES: readonly Tile[] = [
  // 萬子（0-8）
  { type: 'man', number: 1 },
  { type: 'man', number: 2 },
  { type: 'man', number: 3 },
  { type: 'man', number: 4 },
  { type: 'man', number: 5 },
  { type: 'man', number: 6 },
  { type: 'man', number: 7 },
  { type: 'man', number: 8 },
  { type: 'man', number: 9 },

  // 筒子（9-17）
  { type: 'pin', number: 1 },
  { type: 'pin', number: 2 },
  { type: 'pin', number: 3 },
  { type: 'pin', number: 4 },
  { type: 'pin', number: 5 },
  { type: 'pin', number: 6 },
  { type: 'pin', number: 7 },
  { type: 'pin', number: 8 },
  { type: 'pin', number: 9 },

  // 索子（18-26）
  { type: 'sou', number: 1 },
  { type: 'sou', number: 2 },
  { type: 'sou', number: 3 },
  { type: 'sou', number: 4 },
  { type: 'sou', number: 5 },
  { type: 'sou', number: 6 },
  { type: 'sou', number: 7 },
  { type: 'sou', number: 8 },
  { type: 'sou', number: 9 },

  // 風牌（27-30）
  { type: 'wind', wind: 'east' },
  { type: 'wind', wind: 'south' },
  { type: 'wind', wind: 'west' },
  { type: 'wind', wind: 'north' },

  // 三元牌（31-33）
  { type: 'dragon', dragon: 'white' },
  { type: 'dragon', dragon: 'green' },
  { type: 'dragon', dragon: 'red' },
] as const

/**
 * 牌の日本語名マッピング
 */
export const TILE_NAMES: Record<string, string> = {
  // 萬子
  'man-1': '一萬',
  'man-2': '二萬',
  'man-3': '三萬',
  'man-4': '四萬',
  'man-5': '五萬',
  'man-6': '六萬',
  'man-7': '七萬',
  'man-8': '八萬',
  'man-9': '九萬',

  // 筒子
  'pin-1': '一筒',
  'pin-2': '二筒',
  'pin-3': '三筒',
  'pin-4': '四筒',
  'pin-5': '五筒',
  'pin-6': '六筒',
  'pin-7': '七筒',
  'pin-8': '八筒',
  'pin-9': '九筒',

  // 索子
  'sou-1': '一索',
  'sou-2': '二索',
  'sou-3': '三索',
  'sou-4': '四索',
  'sou-5': '五索',
  'sou-6': '六索',
  'sou-7': '七索',
  'sou-8': '八索',
  'sou-9': '九索',

  // 風牌
  'wind-east': '東',
  'wind-south': '南',
  'wind-west': '西',
  'wind-north': '北',

  // 三元牌
  'dragon-white': '白',
  'dragon-green': '發',
  'dragon-red': '中',
}

/**
 * 牌の総数
 */
export const TILE_COUNT = 34

/**
 * 各牌の最大枚数
 */
export const MAX_TILE_COUNT = 4

/**
 * 手牌の枚数
 */
export const HAND_SIZE = 14

/**
 * 面子の数
 */
export const MELD_COUNT = 4

/**
 * 雀頭の枚数
 */
export const PAIR_SIZE = 2
