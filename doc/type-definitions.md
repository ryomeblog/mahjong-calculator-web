# まじゃっぴー（麻雀点数計算アプリ） - 型定義設計書

## 型定義の設計方針

1. **型安全性**: すべてのデータに適切な型を定義
2. **不変性**: readonly を積極的に使用
3. **厳密性**: string ではなく Union Type を使用
4. **ドキュメント**: JSDoc でコメントを記載
5. **再利用性**: 共通型は types/ で一元管理

---

## 基本型定義

### tile.ts - 牌の型定義

```typescript
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

  /** 風牌の値（字牌の場合のみ） */
  readonly wind?: Wind

  /** 三元牌の値（字牌の場合のみ） */
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
 * 么九牌（1, 9, 字牌）
 */
export type TerminalOrHonorTile = NumberTile | HonorTile

/**
 * 么九牌判定のヘルパー型
 */
export type TerminalTile = NumberTile & { readonly number: 1 | 9 }

/**
 * 中張牌（2-8）
 */
export type SimpleTile = NumberTile & {
  readonly number: 2 | 3 | 4 | 5 | 6 | 7 | 8
}
```

---

### meld.ts - 面子の型定義

```typescript
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
}

/**
 * 特殊形の種類
 */
export type SpecialFormType =
  | 'kokushi' // 国士無双
  | 'chiitoitsu' // 七対子

/**
 * 特殊形
 */
export interface SpecialForm {
  readonly type: SpecialFormType
  readonly tiles: readonly Tile[]
  readonly winningTile: Tile
}
```

---

### yaku.ts - 役の型定義

```typescript
/**
 * 役の名前（すべての役）
 */
export type YakuName =
  // 1翻役
  | 'riichi' // 立直
  | 'ippatsu' // 一発
  | 'tsumo' // 門前清自摸和
  | 'tanyao' // 断么九
  | 'pinfu' // 平和
  | 'iipeikou' // 一盃口
  | 'yakuhai-wind' // 役牌（風牌）
  | 'yakuhai-dragon' // 役牌（三元牌）
  | 'haitei' // 海底撈月
  | 'houtei' // 河底撈魚
  | 'rinshan' // 嶺上開花
  | 'chankan' // 槍槓

  // 2翻役
  | 'double-riichi' // 両立直
  | 'chiitoitsu' // 七対子
  | 'chanta' // 混全帯么九
  | 'ikkitsuukan' // 一気通貫
  | 'sanshoku-doujun' // 三色同順
  | 'sanshoku-doukou' // 三色同刻
  | 'sankantsu' // 三槓子
  | 'toitoi' // 対々和
  | 'sanankou' // 三暗刻
  | 'shousangen' // 小三元
  | 'honroutou' // 混老頭

  // 3翻役
  | 'ryanpeikou' // 二盃口
  | 'junchan' // 純全帯么九
  | 'honitsu' // 混一色

  // 6翻役
  | 'chinitsu' // 清一色

  // 役満
  | 'kokushi' // 国士無双
  | 'kokushi-13' // 国士無双十三面待ち
  | 'suuankou' // 四暗刻
  | 'suuankou-tanki' // 四暗刻単騎
  | 'daisangen' // 大三元
  | 'shousuushii' // 小四喜
  | 'daisuushii' // 大四喜
  | 'tsuuiisou' // 字一色
  | 'chinroutou' // 清老頭
  | 'ryuuiisou' // 緑一色
  | 'chuuren' // 九蓮宝燈
  | 'chuuren-9' // 純正九蓮宝燈
  | 'suukantsu' // 四槓子
  | 'tenhou' // 天和
  | 'chiihou' // 地和

/**
 * 役のアイテム
 */
export interface YakuItem {
  /** 役の名前 */
  readonly name: YakuName

  /** 翻数 */
  readonly han: number

  /** 日本語名 */
  readonly displayName: string

  /** 役満かどうか */
  readonly isYakuman: boolean

  /** 食い下がりの翻数（鳴いた場合） */
  readonly openHan?: number
}

/**
 * 役のカテゴリー
 */
export type YakuCategory =
  | 'situational' // 状況役（リーチ、ツモなど）
  | 'hand' // 手役（タンヤオ、ピンフなど）
  | 'color' // 色役（ホンイツ、チンイツ）
  | 'terminal' // 么九役（チャンタ、ジュンチャンなど）
  | 'yakuman' // 役満

/**
 * 役の定義
 */
export interface YakuDefinition {
  readonly name: YakuName
  readonly displayName: string
  readonly han: number
  readonly openHan: number | null
  readonly category: YakuCategory
  readonly isYakuman: boolean
  readonly description: string
}
```

---

### conditions.ts - 和了条件の型定義

```typescript
import type { Wind } from './tile'

/**
 * 和了条件
 */
export interface WinningConditions {
  /** ツモ和了かロン和了か */
  readonly isTsumo: boolean

  /** 立直 */
  readonly isRiichi: boolean

  /** ダブル立直 */
  readonly isDoubleRiichi: boolean

  /** 一発 */
  readonly isIppatsu: boolean

  /** 海底撈月 */
  readonly isHaitei: boolean

  /** 河底撈魚 */
  readonly isHoutei: boolean

  /** 嶺上開花 */
  readonly isRinshan: boolean

  /** 槍槓 */
  readonly isChankan: boolean

  /** 天和 */
  readonly isTenhou: boolean

  /** 地和 */
  readonly isChiihou: boolean

  /** 場風 */
  readonly prevailingWind: Wind

  /** 自風 */
  readonly seatWind: Wind

  /** 親かどうか */
  readonly isDealer: boolean

  /** ドラ枚数 */
  readonly doraCount: number

  /** 裏ドラ枚数 */
  readonly uraDoraCount: number

  /** 赤ドラ枚数 */
  readonly redDoraCount: number
}

/**
 * 和了方法
 */
export type WinMethod = 'tsumo' | 'ron'

/**
 * 局の情報
 */
export interface RoundInfo {
  /** 場風 */
  readonly prevailingWind: Wind

  /** 自風 */
  readonly seatWind: Wind

  /** 本場 */
  readonly honba: number

  /** 供託棒 */
  readonly riichiSticks: number
}
```

---

### result.ts - 計算結果の型定義

```typescript
import type { YakuItem } from './yaku'
import type { MeldGroup } from './meld'
import type { WinningConditions } from './conditions'

/**
 * 符の内訳
 */
export interface FuBreakdown {
  /** 副底 */
  readonly base: number

  /** 面子の符 */
  readonly melds: number

  /** 雀頭の符 */
  readonly pair: number

  /** 待ちの符 */
  readonly wait: number

  /** ツモの符 */
  readonly tsumo: number

  /** 門前加符 */
  readonly concealed: number
}

/**
 * 符計算結果
 */
export interface FuCalculation {
  /** 合計符（切り上げ後） */
  readonly total: number

  /** 内訳 */
  readonly breakdown: FuBreakdown
}

/**
 * 翻の内訳
 */
export interface HanBreakdown {
  /** 役の翻 */
  readonly yaku: number

  /** ドラの翻 */
  readonly dora: number

  /** 裏ドラの翻 */
  readonly uraDora: number

  /** 赤ドラの翻 */
  readonly redDora: number
}

/**
 * 翻計算結果
 */
export interface HanCalculation {
  /** 合計翻 */
  readonly total: number

  /** 内訳 */
  readonly breakdown: HanBreakdown
}

/**
 * 支払い点数
 */
export interface Payment {
  /** ロン和了の点数 */
  readonly ron?: number

  /** ツモ和了（親の場合、各子が払う） */
  readonly tsumoEach?: number

  /** ツモ和了（子の場合、親が払う） */
  readonly tsumoDealer?: number

  /** ツモ和了（子の場合、子が払う） */
  readonly tsumoNonDealer?: number
}

/**
 * 満貫以上の名前
 */
export type LimitHandName =
  | 'mangan' // 満貫
  | 'haneman' // 跳満
  | 'baiman' // 倍満
  | 'sanbaiman' // 三倍満
  | 'yakuman' // 役満
  | 'double-yakuman' // ダブル役満
  | 'triple-yakuman' // トリプル役満

/**
 * 点数計算結果
 */
export interface ScoreCalculation {
  /** 基本点 */
  readonly basePoints: number

  /** 支払い点数 */
  readonly payment: Payment

  /** 満貫以上かどうか */
  readonly isLimitHand: boolean

  /** 満貫以上の名前 */
  readonly limitHandName?: LimitHandName
}

/**
 * 最終的な計算結果（すべての情報を含む）
 */
export interface CalculationResult {
  /** 役 */
  readonly yaku: readonly YakuItem[]

  /** 符計算結果 */
  readonly fu: FuCalculation

  /** 翻計算結果 */
  readonly han: HanCalculation

  /** 点数計算結果 */
  readonly score: ScoreCalculation

  /** 面子分解結果 */
  readonly meldGroups: readonly MeldGroup[]

  /** 選択された面子分解（最も高い点数） */
  readonly selectedMeldGroup: MeldGroup

  /** 和了条件 */
  readonly conditions: WinningConditions
}

/**
 * 計算エラー
 */
export interface CalculationError {
  /** エラータイプ */
  readonly type: 'invalid-hand' | 'no-yaku' | 'no-meld' | 'unknown'

  /** エラーメッセージ */
  readonly message: string

  /** エラー詳細 */
  readonly details?: string
}
```

---

## ユーティリティ型

### parser.ts - パーサー関連の型

```typescript
import type { Tile } from './tile'

/**
 * パース済み手牌
 */
export interface ParsedHand {
  /** 全ての牌（14枚） */
  readonly tiles: readonly Tile[]

  /** 和了牌 */
  readonly winningTile: Tile

  /** 各牌の枚数 */
  readonly tileCount: ReadonlyMap<string, number>

  /** ソート済みか */
  readonly isSorted: boolean
}

/**
 * 手牌のバリデーション結果
 */
export interface HandValidation {
  /** 有効かどうか */
  readonly isValid: boolean

  /** エラーメッセージ（無効な場合） */
  readonly errors: readonly string[]
}
```

---

## 定数型

### constants.ts - 定数の型定義

```typescript
import type { Tile, YakuDefinition } from './types'

/**
 * すべての牌の配列（34種類）
 */
export const ALL_TILES: readonly Tile[] = [
  // 萬子（9種類）
  { type: 'man', number: 1 },
  { type: 'man', number: 2 },
  // ... 省略

  // 筒子（9種類）
  { type: 'pin', number: 1 },
  // ... 省略

  // 索子（9種類）
  { type: 'sou', number: 1 },
  // ... 省略

  // 字牌（7種類）
  { type: 'wind', wind: 'east' },
  { type: 'wind', wind: 'south' },
  { type: 'wind', wind: 'west' },
  { type: 'wind', wind: 'north' },
  { type: 'dragon', dragon: 'white' },
  { type: 'dragon', dragon: 'green' },
  { type: 'dragon', dragon: 'red' },
] as const

/**
 * すべての役の定義
 */
export const YAKU_DEFINITIONS: Record<YakuName, YakuDefinition> = {
  riichi: {
    name: 'riichi',
    displayName: '立直',
    han: 1,
    openHan: null, // 鳴けない
    category: 'situational',
    isYakuman: false,
    description: '門前で立直を宣言し和了する',
  },
  // ... 省略
} as const

/**
 * 満貫以上のテーブル
 */
export const LIMIT_HAND_TABLE = {
  mangan: { han: 5, dealer: 12000, nonDealer: 8000 },
  haneman: { han: 6, dealer: 18000, nonDealer: 12000 },
  baiman: { han: 8, dealer: 24000, nonDealer: 16000 },
  sanbaiman: { han: 11, dealer: 36000, nonDealer: 24000 },
  yakuman: { han: 13, dealer: 48000, nonDealer: 32000 },
} as const
```

---

## React コンポーネント用の型

### component-props.ts - コンポーネントのProps型

```typescript
import type {
  Tile,
  MeldGroup,
  YakuItem,
  CalculationResult,
  WinningConditions,
} from '@/core/mahjong/types'

/**
 * 牌ボタンのProps
 */
export interface TileButtonProps {
  readonly tile: Tile
  readonly onClick: (tile: Tile) => void
  readonly disabled?: boolean
  readonly selected?: boolean
}

/**
 * 手牌表示のProps
 */
export interface HandDisplayProps {
  readonly tiles: readonly Tile[]
  readonly winningTile?: Tile
  readonly onTileRemove?: (index: number) => void
}

/**
 * 牌選択UIのProps
 */
export interface TileSelectorProps {
  readonly onTileSelect: (tile: Tile) => void
  readonly availableTiles?: readonly Tile[]
}

/**
 * 和了条件パネルのProps
 */
export interface WinningConditionsPanelProps {
  readonly conditions: WinningConditions
  readonly onChange: (conditions: WinningConditions) => void
}

/**
 * 計算結果表示のProps
 */
export interface CalculationResultProps {
  readonly result: CalculationResult | null
  readonly error: Error | null
  readonly isCalculating: boolean
}

/**
 * 役リストのProps
 */
export interface YakuListProps {
  readonly yaku: readonly YakuItem[]
}

/**
 * 符内訳のProps
 */
export interface FuBreakdownProps {
  readonly fu: FuCalculation
}

/**
 * 点数表示のProps
 */
export interface ScoreDisplayProps {
  readonly score: ScoreCalculation
  readonly conditions: WinningConditions
}

/**
 * 面子表示のProps
 */
export interface MeldGroupDisplayProps {
  readonly meldGroup: MeldGroup
}
```

---

## カスタムフックの型

### hook-types.ts - フック用の型定義

```typescript
import type {
  Tile,
  WinningConditions,
  CalculationResult,
} from '@/core/mahjong/types'

/**
 * useHandInput の返り値
 */
export interface UseHandInputReturn {
  readonly hand: readonly Tile[]
  readonly winningTile: Tile | null
  readonly addTile: (tile: Tile) => void
  readonly removeTile: (index: number) => void
  readonly setWinningTile: (tile: Tile | null) => void
  readonly canAddTile: boolean
  readonly isValidHand: boolean
  readonly clear: () => void
}

/**
 * useWinningConditions の返り値
 */
export interface UseWinningConditionsReturn {
  readonly conditions: WinningConditions
  readonly toggleCondition: (key: keyof WinningConditions) => void
  readonly updateCondition: (updates: Partial<WinningConditions>) => void
  readonly reset: () => void
}

/**
 * useCalculation の返り値
 */
export interface UseCalculationReturn {
  readonly result: CalculationResult | null
  readonly error: Error | null
  readonly isCalculating: boolean
  readonly calculate: (
    hand: readonly Tile[],
    winningTile: Tile,
    conditions: WinningConditions
  ) => Promise<void>
  readonly clear: () => void
}
```

---

## 型ガード関数

### type-guards.ts - 型ガード

```typescript
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
} from './types'

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
 * 么九牌かどうか判定
 */
export function isTerminalOrHonor(tile: Tile): boolean {
  if (isHonorTile(tile)) return true
  if (isNumberTile(tile)) return tile.number === 1 || tile.number === 9
  return false
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
```

---

## JSON スキーマ対応型

### serialization.ts - シリアライズ用の型

```typescript
/**
 * 牌のJSON表現
 */
export interface TileJson {
  t: string // type
  n?: number // number
  w?: string // wind
  d?: string // dragon
  r?: boolean // isRed
}

/**
 * 計算結果のJSON表現（ローカルストレージ保存用）
 */
export interface CalculationResultJson {
  hand: TileJson[]
  winningTile: TileJson
  conditions: WinningConditionsJson
  yaku: YakuItemJson[]
  fu: number
  han: number
  score: number
  timestamp: number
}

/**
 * 変換関数
 */
export function tileToJson(tile: Tile): TileJson
export function tileFromJson(json: TileJson): Tile
export function resultToJson(result: CalculationResult): CalculationResultJson
export function resultFromJson(json: CalculationResultJson): CalculationResult
```

---

## まとめ

### 型定義のベストプラクティス

1. **Union Type を使う**: `type: 'man' | 'pin' | 'sou'` ではなく具体的な値
2. **readonly を使う**: 不変性を保証
3. **型ガードを実装**: ランタイムで型を判定
4. **extends で型を拡張**: 共通の基底型から拡張
5. **JSDoc でドキュメント**: 型だけでなくコメントも重要

### 型の依存関係

```
基本型 (tile.ts)
  ↓
面子型 (meld.ts)
  ↓
役型 (yaku.ts)
  ↓
結果型 (result.ts)
```

### ファイル配置

```
src/core/mahjong/types/
├── tile.ts           # 牌の型
├── meld.ts           # 面子の型
├── yaku.ts           # 役の型
├── conditions.ts     # 和了条件の型
├── result.ts         # 計算結果の型
├── parser.ts         # パーサー用の型
└── index.ts          # 公開API
```
