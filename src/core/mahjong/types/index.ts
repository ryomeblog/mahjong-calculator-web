/**
 * 型定義の公開API
 */

// 牌の型
export type {
  Tile,
  TileType,
  TileNumber,
  Wind,
  Dragon,
  NumberTile,
  HonorTile,
  WindTile,
  DragonTile,
  TerminalTile,
  SimpleTile,
} from './tile'

// 面子の型
export type {
  Meld,
  MeldType,
  Sequence,
  Triplet,
  Kong,
  Pair,
  WaitType,
  MeldGroup,
  SpecialFormType,
  SpecialForm,
} from './meld'

// 役の型
export type {
  YakuName,
  YakuItem,
  YakuCategory,
  YakuDefinition,
} from './yaku'

// 和了条件の型
export type {
  WinningConditions,
  WinMethod,
  RoundInfo,
} from './conditions'

// 計算結果の型
export type {
  FuBreakdown,
  FuCalculation,
  HanBreakdown,
  HanCalculation,
  Payment,
  LimitHandName,
  ScoreCalculation,
  CalculationResult,
  CalculationError,
} from './result'
