/**
 * 麻雀ロジックの公開API
 */

// 型定義
export type * from './types'

// 定数
export * from './constants'

// ユーティリティ
export * from './utils'

// 面子分解
export {
  decomposeStandard,
  detectSpecialForms,
  detectKokushi,
  detectChiitoitsu,
  detectWaitType,
} from './decomposer'

// 役判定
export { detectYaku, calculateHan } from './yaku'

// 符計算
export { calculateFu } from './fu'

// 点数計算
export { calculateScore, getLimitHand } from './score'
