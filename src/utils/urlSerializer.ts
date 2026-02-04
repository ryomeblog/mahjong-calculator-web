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
  handGroups?: readonly (readonly Tile[])[]
  openGroups?: readonly number[]
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
 * h = 13枚（グループを`-`区切り）, w = 和了牌1枚
 */
export function locationStateToSearchParams(
  state: LocationState
): URLSearchParams {
  const params = new URLSearchParams()

  // h = 13枚（和了牌を除いた手牌、グループ区切り）
  if (state.handGroups && state.handGroups.length > 0) {
    params.set(
      'h',
      state.handGroups.map((g) => tilesToCompactString(g)).join('-')
    )
  } else {
    // handGroupsがない場合: 先頭13枚を使用
    params.set('h', tilesToCompactString(state.tiles.slice(0, 13)))
  }

  // w = 和了牌（1枚）
  params.set('w', tilesToCompactString([state.winningTile]))
  params.set('rw', windToCode(state.roundWind))
  params.set('sw', windToCode(state.seatWind))

  // オプショナルパラメータ
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
  if (state.openGroups && state.openGroups.length > 0) {
    params.set('og', state.openGroups.join(','))
  }

  return params
}

export type ParseResult =
  | { ok: true; state: LocationState }
  | { ok: false; error: string }

/**
 * URLSearchParams → LocationState
 * h = 13枚（`-`区切りでグループ構造を保持）, w = 和了牌1枚
 */
export function searchParamsToLocationState(
  params: URLSearchParams
): ParseResult {
  const h = params.get('h')
  const w = params.get('w')
  const rw = params.get('rw')
  const sw = params.get('sw')

  if (!h || !w || !rw || !sw) {
    const missing = [
      !h && 'h(手牌)',
      !w && 'w(和了牌)',
      !rw && 'rw(場風)',
      !sw && 'sw(自風)',
    ].filter(Boolean)
    return { ok: false, error: `必須パラメータが不足: ${missing.join(', ')}` }
  }

  const roundWind = codeToWind(rw)
  const seatWind = codeToWind(sw)
  if (!roundWind || !seatWind) {
    return {
      ok: false,
      error: `風の値が不正です（rw=${rw}, sw=${sw}）。E/S/W/N のいずれかを指定してください`,
    }
  }

  // h をグループ区切りでパース
  const groupStrings = h.split('-')
  const handGroups = groupStrings.map((g) => compactStringToTiles(g))
  const handTiles = handGroups.flat()

  const winningTiles = compactStringToTiles(w)

  if (handTiles.length !== 13) {
    return {
      ok: false,
      error: `手牌(h)は13枚必要です（現在${handTiles.length}枚）`,
    }
  }
  if (winningTiles.length !== 1) {
    return {
      ok: false,
      error: `和了牌(w)は1枚で指定してください（現在${winningTiles.length}枚）`,
    }
  }

  const winningTile = winningTiles[0]
  // 計算用: 13枚 + 和了牌 = 14枚
  const tiles = [...handTiles, winningTile]

  const doraTilesStr = params.get('dora')
  const uraDoraTilesStr = params.get('ura')
  const ogStr = params.get('og')
  const openGroups = ogStr
    ? ogStr
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined

  return {
    ok: true,
    state: {
      tiles,
      winningTile,
      handGroups,
      openGroups,
      isTsumo: params.get('t') === '1',
      isRiichi: params.get('r') === '1',
      isDoubleRiichi: params.get('dr') === '1',
      roundWind,
      seatWind,
      isDealer: seatWind === 'east',
      doraTiles: doraTilesStr ? compactStringToTiles(doraTilesStr) : [],
      uraDoraTiles: uraDoraTilesStr
        ? compactStringToTiles(uraDoraTilesStr)
        : [],
      honba: parseInt(params.get('hb') || '0', 10),
      isIppatsu: params.get('ip') === '1',
      isChankan: params.get('ck') === '1',
      isRinshan: params.get('rs') === '1',
      isHaitei: params.get('ht') === '1',
      isHoutei: params.get('ho') === '1',
      isTenhou: params.get('th') === '1',
      isChiihou: params.get('ch') === '1',
    },
  }
}
