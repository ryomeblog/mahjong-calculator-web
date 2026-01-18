/**
 * 役判定の公開API
 */

export { detectYaku, calculateHan } from './detector'

// 個別の役判定関数もエクスポート
export { isTanyao } from './one-han/tanyao'
export { isPinfu } from './one-han/pinfu'
export { isToitoi } from './two-han/toitoi'
export { isChinitsu } from './six-han/chinitsu'
export { isDaisangen } from './yakuman/daisangen'
