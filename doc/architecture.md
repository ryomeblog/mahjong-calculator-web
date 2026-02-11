# まじゃっぴー - アーキテクチャ設計書

## 概要

麻雀の点数計算を行うWebアプリケーション。
手牌入力から点数計算までのパイプラインを持ち、React + TypeScript + Tailwind CSSで実装する。

## アーキテクチャ概要

本アプリは以下の3層アーキテクチャで構成される：

```
┌─────────────────────────────────────┐
│          UI 層 (View Layer)          │
│   React Components + Tailwind CSS   │
└─────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────┐
│      状態管理層 (State Layer)        │
│    React Hooks (useState/useReducer) │
└─────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────┐
│      ロジック層 (Logic Layer)        │
│        Pure Functions (core/)        │
└─────────────────────────────────────┘
```

---

## 1. UI層 (View Layer)

### 責務

- ユーザーインターフェースの描画
- ユーザー入力の受付
- 計算結果の表示
- イベントハンドリング

### 構成要素

#### 1.1 コンポーネント構成

```
App
├── TileInputPanel (手牌入力パネル)
│   ├── TileSelector (牌選択UI)
│   ├── HandDisplay (現在の手牌表示)
│   └── WinningConditionInput (和了条件入力)
├── CalculationResult (計算結果表示)
│   ├── YakuList (役リスト)
│   ├── FuCalculation (符計算詳細)
│   └── ScoreDisplay (点数表示)
└── ErrorBoundary (エラーハンドリング)
```

#### 1.2 主要コンポーネント

##### TileInputPanel

- **役割**: 手牌と和了牌の入力を管理
- **Props**:
  - `onHandChange: (tiles: Tile[]) => void`
  - `onWinningTileChange: (tile: Tile) => void`
  - `currentHand: Tile[]`
- **状態**: なし（制御されたコンポーネント）

##### CalculationResult

- **役割**: 計算結果の表示
- **Props**:
  - `result: CalculationResult | null`
  - `error: Error | null`
- **状態**: なし

##### TileSelector

- **役割**: 個々の牌を選択するUI
- **Props**:
  - `onSelect: (tile: Tile) => void`
  - `availableTiles: Tile[]`
- **状態**: なし

---

## 2. 状態管理層 (State Layer)

### 責務

- アプリケーション全体の状態管理
- UI層とロジック層の橋渡し
- 状態の更新とバリデーション

### 構成要素

#### 2.1 状態の種類

```typescript
// アプリケーション状態
interface AppState {
  // 入力状態
  hand: Tile[] // 手牌（14枚）
  winningTile: Tile | null // 和了牌
  conditions: WinningConditions // 和了条件

  // 計算結果
  result: CalculationResult | null

  // UI状態
  isCalculating: boolean
  error: Error | null
}

// 和了条件
interface WinningConditions {
  isTsumo: boolean // ツモ和了
  isRiichi: boolean // リーチ
  isDoubleRiichi: boolean // ダブルリーチ
  isIppatsu: boolean // 一発
  isHaitei: boolean // 海底
  isHoutei: boolean // 河底
  isRinshan: boolean // 嶺上
  isChankan: boolean // 槍槓
  prevailingWind: Wind // 場風
  seatWind: Wind // 自風
  doraCount: number // ドラ枚数
  uraDoraCount: number // 裏ドラ枚数
}

// 計算結果
interface CalculationResult {
  yaku: YakuItem[] // 役リスト
  fu: number // 符
  han: number // 翻
  basePoints: number // 基本点
  payment: Payment // 支払い点数
  meldGroups: MeldGroup[] // 面子分解結果
}
```

#### 2.2 カスタムフック

##### useHandInput

```typescript
/**
 * 手牌入力を管理するフック
 */
function useHandInput() {
  const [hand, setHand] = useState<Tile[]>([])
  const [winningTile, setWinningTile] = useState<Tile | null>(null)

  const addTile = (tile: Tile) => { ... }
  const removeTile = (index: number) => { ... }
  const canAddTile = () => hand.length < 14
  const isValidHand = () => validateHand(hand)

  return { hand, winningTile, addTile, removeTile, canAddTile, isValidHand }
}
```

##### useCalculation

```typescript
/**
 * 点数計算を実行するフック
 */
function useCalculation() {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const calculate = async (
    hand: Tile[],
    winningTile: Tile,
    conditions: WinningConditions
  ) => {
    setIsCalculating(true)
    setError(null)

    try {
      // ロジック層の関数を呼び出し
      const meldGroups = decomposeMelds(hand, winningTile)
      const yaku = detectYaku(meldGroups, conditions)
      const fu = calculateFu(meldGroups, conditions)
      const han = calculateHan(yaku, conditions)
      const score = calculateScore(fu, han, conditions)

      setResult({ yaku, fu, han, ...score, meldGroups })
    } catch (e) {
      setError(e as Error)
    } finally {
      setIsCalculating(false)
    }
  }

  return { result, isCalculating, error, calculate }
}
```

##### useWinningConditions

```typescript
/**
 * 和了条件を管理するフック
 */
function useWinningConditions() {
  const [conditions, setConditions] = useState<WinningConditions>({
    isTsumo: false,
    isRiichi: false,
    // ... 初期値
  })

  const toggleCondition = (key: keyof WinningConditions) => { ... }
  const updateCondition = (updates: Partial<WinningConditions>) => { ... }

  return { conditions, toggleCondition, updateCondition }
}
```

---

## 3. ロジック層 (Logic Layer)

### 責務

- 麻雀のルールロジックの実装
- すべて純粋関数として実装
- 副作用なし、テスト容易性が高い

### 構成要素

#### 3.1 パイプライン処理

```typescript
// 点数計算パイプライン
function calculateMahjongScore(
  hand: Tile[],
  winningTile: Tile,
  conditions: WinningConditions
): CalculationResult {
  // 1. 牌解析
  const tiles = parseTiles(hand, winningTile)

  // 2. 面子分解
  const meldGroups = decomposeMelds(tiles)

  // 3. 役判定
  const yaku = detectYaku(meldGroups, conditions)

  // 4. 符計算
  const fu = calculateFu(meldGroups, conditions)

  // 5. 翻計算
  const han = calculateHan(yaku, conditions)

  // 6. 点数計算
  const payment = calculatePayment(fu, han, conditions)

  return { yaku, fu, han, payment, meldGroups }
}
```

#### 3.2 主要モジュール

##### parser.ts - 牌解析

```typescript
/**
 * 牌の配列を解析し、正規化する
 */
export function parseTiles(hand: Tile[], winningTile: Tile): ParsedHand {
  // 牌の正規化
  // 重複チェック
  // 枚数制限チェック
  return { ... }
}

/**
 * 手牌が有効かバリデーション
 */
export function validateHand(tiles: Tile[]): boolean {
  // 枚数チェック
  // 牌の種類チェック
  // 同一牌の枚数チェック（最大4枚）
  return true
}
```

##### meld-decomposer.ts - 面子分解

```typescript
/**
 * 手牌を面子と雀頭に分解する
 * すべての可能なパターンを返す
 */
export function decomposeMelds(tiles: Tile[]): MeldGroup[] {
  // 再帰的に面子分解
  // 順子・刻子・雀頭の組み合わせを探索
  // バックトラッキングで全パターン生成
  return []
}

/**
 * 国士無双・七対子など特殊形を判定
 */
export function detectSpecialForms(tiles: Tile[]): SpecialForm | null {
  return null
}
```

##### yaku-detector.ts - 役判定

```typescript
/**
 * 面子分解結果から役を判定
 */
export function detectYaku(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): YakuItem[] {
  const yaku: YakuItem[] = []

  // 各役の判定関数を呼び出し
  if (isRiichi(conditions)) yaku.push({ name: 'riichi', han: 1 })
  if (isTanyao(meldGroup)) yaku.push({ name: 'tanyao', han: 1 })
  if (isPinfu(meldGroup)) yaku.push({ name: 'pinfu', han: 1 })
  // ... その他の役

  return yaku
}

// 個別の役判定関数
export function isTanyao(meldGroup: MeldGroup): boolean { ... }
export function isPinfu(meldGroup: MeldGroup): boolean { ... }
export function isHonitsu(meldGroup: MeldGroup): boolean { ... }
// ... 約40種類の役判定関数
```

##### fu-calculator.ts - 符計算

```typescript
/**
 * 符を計算
 */
export function calculateFu(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): number {
  let fu = 20 // 副底

  // 面子の符
  fu += calculateMeldFu(meldGroup.melds)

  // 雀頭の符
  fu += calculatePairFu(meldGroup.pair, conditions)

  // 待ちの符
  fu += calculateWaitFu(meldGroup.wait)

  // 和了方法の符
  fu += conditions.isTsumo ? 2 : 0

  // 切り上げ
  return Math.ceil(fu / 10) * 10
}
```

##### score-calculator.ts - 点数計算

```typescript
/**
 * 符と翻から点数を計算
 */
export function calculateScore(
  fu: number,
  han: number,
  conditions: WinningConditions
): Payment {
  // 基本点計算
  const basePoints = fu * Math.pow(2, han + 2)

  // 満貫以上の判定
  if (han >= 5) {
    return calculateLimitHand(han)
  }

  // 親・子の支払い計算
  return conditions.isDealer
    ? calculateDealerPayment(basePoints, conditions.isTsumo)
    : calculateNonDealerPayment(basePoints, conditions.isTsumo)
}
```

---

## 4. データフロー

### 4.1 入力フロー

```
User Input (UI層)
  ↓
Event Handler
  ↓
State Update (状態管理層)
  ↓
Re-render (UI層)
```

### 4.2 計算フロー

```
Calculate Button Click (UI層)
  ↓
useCalculation Hook (状態管理層)
  ↓
Core Logic Functions (ロジック層)
  parseTiles
    ↓
  decomposeMelds
    ↓
  detectYaku
    ↓
  calculateFu
    ↓
  calculateHan
    ↓
  calculateScore
  ↓
Result State Update (状態管理層)
  ↓
Result Display (UI層)
```

---

## 5. エラーハンドリング

### 5.1 エラーの種類

```typescript
// カスタムエラー型
class InvalidHandError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidHandError'
  }
}

class CalculationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CalculationError'
  }
}
```

### 5.2 エラーハンドリング戦略

- **UI層**: ErrorBoundaryでキャッチし、ユーザーフレンドリーなメッセージを表示
- **状態管理層**: try-catchでエラーをキャッチし、error状態に格納
- **ロジック層**: バリデーションエラーは例外をthrow

---

## 6. パフォーマンス最適化

### 6.1 メモ化戦略

```typescript
// 計算結果のメモ化
const memoizedDecompose = useMemo(
  () => decomposeMelds(hand),
  [hand]
)

// コンポーネントのメモ化
const TileDisplay = memo(({ tile }: Props) => { ... })
```

### 6.2 遅延計算

- 面子分解は計算ボタン押下時のみ実行
- 手牌入力中はバリデーションのみ実行

---

## 7. テスト戦略

### 7.1 ユニットテスト

- **ロジック層**: すべての純粋関数に対してテスト
- **カバレッジ目標**: 90%以上

```typescript
describe('decomposeMelds', () => {
  it('should decompose a simple hand', () => {
    const tiles = [
      /* ... */
    ]
    const result = decomposeMelds(tiles)
    expect(result).toHaveLength(1)
  })
})
```

### 7.2 統合テスト

- パイプライン全体のテスト
- 実際の和了例でテスト

### 7.3 E2Eテスト

- ユーザーシナリオベースのテスト
- 手牌入力 → 計算 → 結果表示

---

## 8. 拡張性

### 8.1 将来の拡張ポイント

- ローカルルール対応（赤ドラ、喰いタン等）
- 複数の和了パターン表示
- 点数計算履歴
- 牌譜入力対応
- サーバーサイド連携

### 8.2 プラグイン設計

```typescript
// 役判定プラグイン
interface YakuPlugin {
  name: string
  detect: (meldGroup: MeldGroup) => YakuItem | null
}

// プラグインの登録
registerYakuPlugin(customYakuPlugin)
```
