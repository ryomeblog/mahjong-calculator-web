/**
 * 型ガード関数
 */

import type {
  Tile,
  NumberTile,
  HonorTile,
  WindTile,
  DragonTile,
  Meld,
  Sequence,
  Triplet,
  Kong,
  Pair,
} from '../types'

/**
 * 数牌かどうか判定
 */
export function isNumberTile(tile: Tile): tile is NumberTile {
  return tile.type === 'man' || tile.type === 'pin' || tile.type === 'sou'
}

/**
 * 字牌かどうか判定
 */
export function isHonorTile(tile: Tile): tile is HonorTile {
  return tile.type === 'wind' || tile.type === 'dragon'
}

/**
 * 風牌かどうか判定
 */
export function isWindTile(tile: Tile): tile is WindTile {
  return tile.type === 'wind'
}

/**
 * 三元牌かどうか判定
 */
export function isDragonTile(tile: Tile): tile is DragonTile {
  return tile.type === 'dragon'
}

/**
 * 順子かどうか判定
 */
export function isSequence(meld: Meld): meld is Sequence {
  return meld.type === 'sequence'
}

/**
 * 刻子かどうか判定
 */
export function isTriplet(meld: Meld): meld is Triplet {
  return meld.type === 'triplet'
}

/**
 * 槓子かどうか判定
 */
export function isKong(meld: Meld): meld is Kong {
  return meld.type === 'kong'
}

/**
 * 雀頭かどうか判定
 */
export function isPair(meld: Meld): meld is Pair {
  return meld.type === 'pair'
}

/**
 * 順子・刻子・槓子（雀頭以外）かどうか判定
 */
export function isProperMeld(meld: Meld): meld is Sequence | Triplet | Kong {
  return isSequence(meld) || isTriplet(meld) || isKong(meld)
}

/**
 * 暗刻・暗槓かどうか判定
 */
export function isConcealedMeld(meld: Meld): boolean {
  return meld.isConcealed && (isTriplet(meld) || isKong(meld))
}
