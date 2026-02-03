/**
 * URL クエリパラメータのシリアライズ/デシリアライズユーティリティ
 * 天鳳形式の牌表記を使用
 */

import type { Tile, Wind } from '@/core/mahjong'

// --- 牌 ⇔ 表記変換 ---

type Suit = 'm' | 'p' | 's' | 'z'

const TILE_TYPE_TO_SUIT: Record<string, Suit> = {
  man: 'm',
  pin: 'p',
  sou: 's',
}

const SUIT_TO_TILE_TYPE: Record<Suit, string> = {
  m: 'man',
  p: 'pin',
  s: 'sou',
  z: 'z', // handled separately
}

const WIND_VALUES = ['east', 'south', 'west', 'north'] as const
const DRAGON_VALUES = ['white', 'green', 'red'] as const

/**
 * 単一の牌を数値+スーツペアに変換
 * 赤五萬 → { num: 0, suit: 'm' }
 */
function tileToNumSuit(tile: Tile): { num: number; suit: Suit } {
  if (tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou') {
    const num = tile.isRed ? 0 : tile.number!
    return { num, suit: TILE_TYPE_TO_SUIT[tile.type] }
  }
  if (tile.type === 'wind') {
    const idx = WIND_VALUES.indexOf(tile.wind as (typeof WIND_VALUES)[number])
    return { num: idx + 1, suit: 'z' }
  }
  // dragon
  const idx = DRAGON_VALUES.indexOf(
    tile.dragon as (typeof DRAGON_VALUES)[number]
  )
  return { num: idx + 5, suit: 'z' }
}

/**
 * 数値+スーツペアから牌に変換
 */
function numSuitToTile(num: number, suit: Suit): Tile {
  if (suit === 'm' || suit === 'p' || suit === 's') {
    const type = SUIT_TO_TILE_TYPE[suit] as 'man' | 'pin' | 'sou'
    if (num === 0) {
      return { type, number: 5 as Tile['number'], isRed: true }
    }
    return { type, number: num as Tile['number'] }
  }
  // suit === 'z'
  if (num >= 1 && num <= 4) {
    return { type: 'wind', wind: WIND_VALUES[num - 1] }
  }
  if (num >= 5 && num <= 7) {
    return { type: 'dragon', dragon: DRAGON_VALUES[num - 5] }
  }
  throw new Error(`Invalid honor tile number: ${num}`)
}

/**
 * 牌配列 → グルーピング文字列 (天鳳形式)
 * 例: [一萬, 二萬, 三萬, 四筒, 五筒, 六筒] → "123m456p"
 */
export function tilesToCompactString(tiles: readonly Tile[]): string {
  // スーツごとにグルーピング
  const groups: Record<Suit, number[]> = { m: [], p: [], s: [], z: [] }
  for (const tile of tiles) {
    const { num, suit } = tileToNumSuit(tile)
    groups[suit].push(num)
  }

  let result = ''
  for (const suit of ['m', 'p', 's', 'z'] as Suit[]) {
    if (groups[suit].length > 0) {
      result += groups[suit].join('') + suit
    }
  }
  return result
}

/**
 * グルーピング文字列 → 牌配列
 * 例: "123m456p789s11z" → 牌配列
 */
export function compactStringToTiles(str: string): Tile[] {
  const tiles: Tile[] = []
  let nums: number[] = []

  for (const ch of str) {
    if (ch >= '0' && ch <= '9') {
      nums.push(parseInt(ch, 10))
    } else if (ch === 'm' || ch === 'p' || ch === 's' || ch === 'z') {
      for (const n of nums) {
        tiles.push(numSuitToTile(n, ch as Suit))
      }
      nums = []
    }
  }
  return tiles
}

// --- 風 ⇔ コード変換 ---

const WIND_TO_CODE: Record<Wind, string> = {
  east: 'E',
  south: 'S',
  west: 'W',
  north: 'N',
}

const CODE_TO_WIND: Record<string, Wind> = {
  E: 'east',
  S: 'south',
  W: 'west',
  N: 'north',
}

export function windToCode(wind: Wind): string {
  return WIND_TO_CODE[wind]
}

export function codeToWind(code: string): Wind | null {
  return CODE_TO_WIND[code] ?? null
}

// --- LocationState ⇔ URLSearchParams ---

interface LocationState {
  tiles: readonly Tile[]
  winningTile: Tile
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  roundWind: Wind
  seatWind: Wind
  isDealer: boolean
  doraTiles?: readonly Tile[]
  uraDoraTiles?: readonly Tile[]
  honba?: number
  isIppatsu?: boolean
  isChankan?: boolean
  isRinshan?: boolean
  isHaitei?: boolean
  isHoutei?: boolean
  isTenhou?: boolean
  isChiihou?: boolean
}

/**
 * LocationState → URLSearchParams
 */
export function locationStateToSearchParams(
  state: LocationState
): URLSearchParams {
  const params = new URLSearchParams()

  // 必須パラメータ
  params.set('h', tilesToCompactString(state.tiles))
  params.set('w', tilesToCompactString([state.winningTile]))
  params.set('rw', windToCode(state.roundWind))
  params.set('sw', windToCode(state.seatWind))

  // オプショナルパラメータ（デフォルトと異なる場合のみ設定）
  if (state.isTsumo) params.set('t', '1')
  if (state.isRiichi) params.set('r', '1')
  if (state.isDoubleRiichi) params.set('dr', '1')
  if (state.doraTiles && state.doraTiles.length > 0) {
    params.set('dora', tilesToCompactString(state.doraTiles))
  }
  if (state.uraDoraTiles && state.uraDoraTiles.length > 0) {
    params.set('ura', tilesToCompactString(state.uraDoraTiles))
  }
  if (state.honba && state.honba > 0) {
    params.set('hb', String(state.honba))
  }
  if (state.isIppatsu) params.set('ip', '1')
  if (state.isChankan) params.set('ck', '1')
  if (state.isRinshan) params.set('rs', '1')
  if (state.isHaitei) params.set('ht', '1')
  if (state.isHoutei) params.set('ho', '1')
  if (state.isTenhou) params.set('th', '1')
  if (state.isChiihou) params.set('ch', '1')

  return params
}

/**
 * URLSearchParams → LocationState (失敗時は null)
 */
export function searchParamsToLocationState(
  params: URLSearchParams
): LocationState | null {
  const h = params.get('h')
  const w = params.get('w')
  const rw = params.get('rw')
  const sw = params.get('sw')

  // 必須パラメータのバリデーション
  if (!h || !w || !rw || !sw) return null

  const roundWind = codeToWind(rw)
  const seatWind = codeToWind(sw)
  if (!roundWind || !seatWind) return null

  const tiles = compactStringToTiles(h)
  const winningTiles = compactStringToTiles(w)
  if (tiles.length !== 14 || winningTiles.length !== 1) return null

  const winningTile = winningTiles[0]

  const doraTilesStr = params.get('dora')
  const uraDoraTilesStr = params.get('ura')

  return {
    tiles,
    winningTile,
    isTsumo: params.get('t') === '1',
    isRiichi: params.get('r') === '1',
    isDoubleRiichi: params.get('dr') === '1',
    roundWind,
    seatWind,
    isDealer: seatWind === 'east',
    doraTiles: doraTilesStr ? compactStringToTiles(doraTilesStr) : [],
    uraDoraTiles: uraDoraTilesStr ? compactStringToTiles(uraDoraTilesStr) : [],
    honba: parseInt(params.get('hb') || '0', 10),
    isIppatsu: params.get('ip') === '1',
    isChankan: params.get('ck') === '1',
    isRinshan: params.get('rs') === '1',
    isHaitei: params.get('ht') === '1',
    isHoutei: params.get('ho') === '1',
    isTenhou: params.get('th') === '1',
    isChiihou: params.get('ch') === '1',
  }
}
