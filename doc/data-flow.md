# まじゃっぴー - データフロー設計書

## データフロー概要

本アプリのデータは、以下の順序で処理される：

```
User Input (手牌入力・条件入力)
  ↓
State Update (React State)
  ↓
Calculation Trigger (計算ボタン)
  ↓
Core Logic Pipeline (純粋関数のパイプライン)
  ├─ 1. Parse (牌解析)
  ├─ 2. Decompose (面子分解)
  ├─ 3. Detect Yaku (役判定)
  ├─ 4. Calculate Fu (符計算)
  ├─ 5. Calculate Han (翻計算)
  └─ 6. Calculate Score (点数計算)
  ↓
Result State Update
  ↓
UI Update (結果表示)
```

---

## 詳細データフロー

### 1. 手牌入力フロー

```
┌─────────────┐
│   User      │ クリック
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ TileButton          │ onClick イベント
│ (UI層)              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ useHandInput        │ addTile(tile)
│ (状態管理層)        │
│                     │
│ const [hand,        │
│   setHand] =        │
│   useState([])      │
└──────┬──────────────┘
       │
       ├─ バリデーション
       │  - 枚数チェック (最大14枚)
       │  - 同一牌チェック (最大4枚)
       │
       ▼
┌─────────────────────┐
│ validateHand()      │ core/mahjong/parser
│ (ロジック層)        │
└──────┬──────────────┘
       │
       ▼ OK
┌─────────────────────┐
│ setHand([...hand,   │
│   tile])            │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ HandDisplay         │ 再レンダリング
│ (UI層)              │
│ {hand.map(tile =>   │
│   <Tile />)}        │
└─────────────────────┘
```

**データ型**:

```typescript
// 入力
onClick: (tile: Tile) => void

// 状態
hand: Tile[]  // 最大14枚

// バリデーション
validateHand(hand: Tile[]): boolean

// 出力
<HandDisplay hand={Tile[]} />
```

---

### 2. 和了条件入力フロー

```
┌─────────────┐
│   User      │ チェックボックスクリック
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ ConditionCheckbox       │ onChange イベント
│ (UI層)                  │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ useWinningConditions    │ toggleCondition(key)
│ (状態管理層)            │
│                         │
│ const [conditions,      │
│   setConditions] =      │
│   useState({...})       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ setConditions({         │
│   ...conditions,        │
│   [key]: !value         │
│ })                      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ WinningConditionsPanel  │ 再レンダリング
│ (UI層)                  │
└─────────────────────────┘
```

**データ型**:

```typescript
interface WinningConditions {
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  isIppatsu: boolean
  isHaitei: boolean
  isHoutei: boolean
  isRinshan: boolean
  isChankan: boolean
  prevailingWind: Wind
  seatWind: Wind
  doraCount: number
  uraDoraCount: number
}
```

---

### 3. 点数計算フロー（メインフロー）

```
┌─────────────┐
│   User      │ 計算ボタンクリック
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ CalculateButton             │ onClick
│ (UI層)                      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ useCalculation              │ calculate()
│ (状態管理層)                │
│                             │
│ const [result, setResult] = │
│   useState(null)            │
│ const [error, setError] =   │
│   useState(null)            │
└──────┬──────────────────────┘
       │
       ├─ setIsCalculating(true)
       │
       ▼
┌──────────────────────────────────────────────────┐
│          Core Logic Pipeline (ロジック層)         │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ 1. parseTiles(hand, winningTile)       │    │
│  │    ↓                                   │    │
│  │    ParsedHand {                        │    │
│  │      tiles: Tile[],                    │    │
│  │      winningTile: Tile                 │    │
│  │    }                                   │    │
│  └────────────────────────────────────────┘    │
│               ↓                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 2. decomposeMelds(tiles)               │    │
│  │    ↓                                   │    │
│  │    MeldGroup[] {                       │    │
│  │      melds: Meld[],      // 4面子      │    │
│  │      pair: Pair,         // 雀頭       │    │
│  │      wait: WaitType      // 待ち       │    │
│  │    }                                   │    │
│  └────────────────────────────────────────┘    │
│               ↓                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 3. detectYaku(meldGroup, conditions)   │    │
│  │    ↓                                   │    │
│  │    YakuItem[] {                        │    │
│  │      name: string,                     │    │
│  │      han: number,                      │    │
│  │      isYakuman: boolean                │    │
│  │    }                                   │    │
│  └────────────────────────────────────────┘    │
│               ↓                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 4. calculateFu(meldGroup, conditions)  │    │
│  │    ↓                                   │    │
│  │    Fu {                                │    │
│  │      total: number,        // 30符     │    │
│  │      breakdown: {          // 内訳     │    │
│  │        base: 20,                       │    │
│  │        melds: 4,                       │    │
│  │        pair: 2,                        │    │
│  │        wait: 2,                        │    │
│  │        tsumo: 2                        │    │
│  │      }                                 │    │
│  │    }                                   │    │
│  └────────────────────────────────────────┘    │
│               ↓                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 5. calculateHan(yaku, conditions)      │    │
│  │    ↓                                   │    │
│  │    Han {                               │    │
│  │      total: number,        // 3翻      │    │
│  │      yaku: 2,              // 役の翻   │    │
│  │      dora: 1               // ドラ     │    │
│  │    }                                   │    │
│  └────────────────────────────────────────┘    │
│               ↓                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 6. calculateScore(fu, han, conditions) │    │
│  │    ↓                                   │    │
│  │    Score {                             │    │
│  │      basePoints: number,   // 基本点   │    │
│  │      payment: {                        │    │
│  │        ron?: number,                   │    │
│  │        tsumoDealer?: number,           │    │
│  │        tsumoNonDealer?: number         │    │
│  │      },                                │    │
│  │      isLimitHand: boolean, // 満貫以上 │    │
│  │      limitHandName?: string            │    │
│  │    }                                   │    │
│  └────────────────────────────────────────┘    │
│                                                  │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────┐
│ setResult({                 │
│   yaku,                     │
│   fu,                       │
│   han,                      │
│   score,                    │
│   meldGroups                │
│ })                          │
│ setIsCalculating(false)     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ CalculationResult           │ 再レンダリング
│ (UI層)                      │
│                             │
│ ├─ YakuList                 │
│ ├─ FuBreakdown              │
│ ├─ ScoreDisplay             │
│ └─ MeldGroupDisplay         │
└─────────────────────────────┘
```

---

## 各パイプライン段階の詳細

### Stage 1: parseTiles (牌解析)

**入力**:

```typescript
hand: Tile[]            // 13枚の手牌
winningTile: Tile       // 和了牌
```

**処理**:

1. 手牌 + 和了牌を結合 (14枚)
2. ソート (萬子 → 筒子 → 索子 → 字牌)
3. バリデーション
   - 同一牌が4枚以下
   - 牌の種類が正しい

**出力**:

```typescript
ParsedHand {
  tiles: Tile[],        // ソート済み14枚
  winningTile: Tile,    // 和了牌
  tileCount: Map<Tile, number>  // 各牌の枚数
}
```

**エラー**:

- `InvalidHandError`: 手牌が不正

---

### Stage 2: decomposeMelds (面子分解)

**入力**:

```typescript
parsedHand: ParsedHand
```

**処理**:

1. 特殊形判定（国士無双、七対子）
2. 標準形の再帰的分解
   - 順子を探す
   - 刻子を探す
   - 雀頭を探す
3. すべての分解パターンを生成

**アルゴリズム**:

```typescript
function decompose(tiles: Tile[], melds: Meld[]): MeldGroup[] {
  // ベースケース: すべての牌を使い切った
  if (tiles.length === 0) {
    return [{ melds, pair: null }]
  }

  // 雀頭候補
  if (melds.length === 0) {
    const pair = findPair(tiles)
    if (pair) {
      // 雀頭を除いた残りで再帰
      return decompose(removePair(tiles, pair), melds)
    }
  }

  const results: MeldGroup[] = []

  // 順子を試す
  const sequence = findSequence(tiles)
  if (sequence) {
    results.push(
      ...decompose(removeSequence(tiles, sequence), [...melds, sequence])
    )
  }

  // 刻子を試す
  const triplet = findTriplet(tiles)
  if (triplet) {
    results.push(
      ...decompose(removeTriplet(tiles, triplet), [...melds, triplet])
    )
  }

  return results
}
```

**出力**:

```typescript
MeldGroup[] {
  melds: Meld[],        // 4面子
  pair: Pair,           // 雀頭
  wait: WaitType,       // 待ちの形
  isSpecial: boolean    // 特殊形か
}
```

---

### Stage 3: detectYaku (役判定)

**入力**:

```typescript
meldGroup: MeldGroup
conditions: WinningConditions
```

**処理**:
各役の判定関数を順番に実行

```typescript
const yaku: YakuItem[] = []

// 状況役
if (conditions.isRiichi) yaku.push({ name: 'riichi', han: 1 })
if (conditions.isTsumo) yaku.push({ name: 'tsumo', han: 1 })

// 手役
if (isTanyao(meldGroup)) yaku.push({ name: 'tanyao', han: 1 })
if (isPinfu(meldGroup)) yaku.push({ name: 'pinfu', han: 1 })
if (isIkkitsuukan(meldGroup)) yaku.push({ name: 'ikkitsuukan', han: 2 })

// 役満
if (isKokushi(meldGroup))
  yaku.push({ name: 'kokushi', han: 13, isYakuman: true })
```

**役の優先順位**:

1. 役満 (天和、地和など)
2. 高翻役
3. 低翻役

**出力**:

```typescript
YakuItem[] {
  name: string,         // 役の名前
  han: number,          // 翻数
  isYakuman: boolean    // 役満フラグ
}
```

---

### Stage 4: calculateFu (符計算)

**入力**:

```typescript
meldGroup: MeldGroup
conditions: WinningConditions
```

**処理**:

```typescript
let fu = 20 // 副底

// 面子の符
for (const meld of meldGroup.melds) {
  if (meld.type === 'triplet') {
    fu += meld.isTerminal ? 8 : 4 // 么九刻子 or 中張刻子
    if (meld.isConcealed) fu *= 2 // 暗刻
  }
  if (meld.type === 'kong') {
    fu += meld.isTerminal ? 32 : 16
    if (meld.isConcealed) fu *= 2 // 暗槓
  }
}

// 雀頭の符
if (isYakuhaiPair(meldGroup.pair, conditions)) {
  fu += 2
}

// 待ちの符
if (isEdgeWait(meldGroup.wait)) fu += 2 // 辺張待ち
if (isClosedWait(meldGroup.wait)) fu += 2 // 嵌張待ち
if (isPairWait(meldGroup.wait)) fu += 2 // 単騎待ち

// 和了方法の符
if (conditions.isTsumo) fu += 2

// 平和ツモは20符固定
if (isPinfu(meldGroup) && conditions.isTsumo) {
  return 20
}

// 切り上げ（10の位）
return Math.ceil(fu / 10) * 10
```

**出力**:

```typescript
FuCalculation {
  total: number,        // 合計符（切り上げ後）
  breakdown: {
    base: 20,           // 副底
    melds: number,      // 面子の符
    pair: number,       // 雀頭の符
    wait: number,       // 待ちの符
    tsumo: number       // ツモの符
  }
}
```

---

### Stage 5: calculateHan (翻計算)

**入力**:

```typescript
yaku: YakuItem[]
conditions: WinningConditions
```

**処理**:

```typescript
// 役の翻数を合計
const yakuHan = yaku.reduce((sum, y) => sum + y.han, 0)

// ドラの翻数
const doraHan = conditions.doraCount + conditions.uraDoraCount

// 合計
const totalHan = yakuHan + doraHan

return {
  total: totalHan,
  yaku: yakuHan,
  dora: doraHan,
}
```

**出力**:

```typescript
HanCalculation {
  total: number,        // 合計翻
  yaku: number,         // 役の翻
  dora: number          // ドラの翻
}
```

---

### Stage 6: calculateScore (点数計算)

**入力**:

```typescript
fu: number
han: number
conditions: WinningConditions
```

**処理**:

```typescript
// 役満の場合
if (han >= 13) {
  const yakumanMultiplier = Math.floor(han / 13)
  return calculateYakumanScore(yakumanMultiplier, conditions.isDealer)
}

// 満貫以上の判定
if (han >= 5 || (han >= 4 && fu >= 40) || (han >= 3 && fu >= 70)) {
  return calculateLimitHand(han, fu, conditions.isDealer)
}

// 通常計算
const basePoints = fu * Math.pow(2, han + 2)

// 親の場合
if (conditions.isDealer) {
  if (conditions.isTsumo) {
    // 親のツモ: 子が2倍ずつ払う
    const eachPayment = Math.ceil((basePoints * 2) / 100) * 100
    return { payment: { tsumoEach: eachPayment } }
  } else {
    // 親のロン: 放銃者が6倍払う
    const ronPayment = Math.ceil((basePoints * 6) / 100) * 100
    return { payment: { ron: ronPayment } }
  }
}

// 子の場合
if (conditions.isTsumo) {
  // 子のツモ
  const dealerPayment = Math.ceil((basePoints * 2) / 100) * 100
  const nonDealerPayment = Math.ceil(basePoints / 100) * 100
  return {
    payment: { tsumoDealer: dealerPayment, tsumoNonDealer: nonDealerPayment },
  }
} else {
  // 子のロン
  const ronPayment = Math.ceil((basePoints * 4) / 100) * 100
  return { payment: { ron: ronPayment } }
}
```

**満貫以上のテーブル**:
| 翻 | 名前 | 親 | 子 |
|----|------|-----|-----|
| 3-4翻 | 満貫 | 12000 | 8000 |
| 6-7翻 | 跳満 | 18000 | 12000 |
| 8-10翻 | 倍満 | 24000 | 16000 |
| 11-12翻 | 三倍満 | 36000 | 24000 |
| 13翻+ | 役満 | 48000 | 32000 |

**出力**:

```typescript
ScoreCalculation {
  basePoints: number,       // 基本点
  payment: {
    ron?: number,           // ロン和了の点数
    tsumoEach?: number,     // 親のツモ（各自）
    tsumoDealer?: number,   // 子のツモ（親）
    tsumoNonDealer?: number // 子のツモ（子）
  },
  isLimitHand: boolean,     // 満貫以上か
  limitHandName?: string    // '満貫', '跳満' など
}
```

---

## エラーハンドリングフロー

```
Core Logic
  ↓ throw Error
┌─────────────────────┐
│ useCalculation      │ try-catch
│ (状態管理層)        │
└──────┬──────────────┘
       │
       ▼ setError(e)
┌─────────────────────┐
│ ErrorMessage        │ 表示
│ (UI層)              │
│ {error?.message}    │
└─────────────────────┘
```

**エラーの種類**:

1. **InvalidHandError**: 手牌が不正（枚数、同一牌など）
2. **NoValidMeldError**: 面子分解できない
3. **NoYakuError**: 役がない
4. **CalculationError**: 計算エラー

---

## 状態の永続化（オプション）

```
useCalculation
  ↓
calculateScore()
  ↓ 計算完了
setResult(result)
  ↓
useEffect(() => {
  localStorage.setItem('lastResult', JSON.stringify(result))
}, [result])
```

**保存データ**:

- 最後の手牌
- 最後の計算結果
- 計算履歴（オプション）

---

## まとめ

### データフローの特徴

1. **単方向フロー**: UI → State → Logic → State → UI
2. **純粋関数**: ロジック層はすべて副作用なし
3. **型安全**: TypeScript で型保証
4. **エラーハンドリング**: 各層でエラーをキャッチ
5. **パフォーマンス**: メモ化と遅延実行

### 主要なデータ型の流れ

```
User Input
  ↓
Tile[]                    (手牌)
  ↓
ParsedHand                (解析済み手牌)
  ↓
MeldGroup[]               (面子分解結果)
  ↓
YakuItem[]                (役)
  ↓
FuCalculation             (符)
  ↓
HanCalculation            (翻)
  ↓
ScoreCalculation          (点数)
  ↓
CalculationResult         (最終結果)
  ↓
UI Display                (表示)
```
