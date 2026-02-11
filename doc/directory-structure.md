# まじゃっぴー - ディレクトリ構成設計書

## ディレクトリ構成

```
mahjong-calculator-web/
├── doc/                          # 設計書・ドキュメント
│   ├── architecture.md           # アーキテクチャ設計書
│   ├── directory-structure.md    # 本ファイル
│   └── data-flow.md              # データフロー図
│
├── src/
│   ├── main.tsx                  # アプリケーションエントリーポイント
│   ├── App.tsx                   # ルートコンポーネント
│   ├── index.css                 # グローバルスタイル（Tailwind含む）
│   │
│   ├── core/                     # ロジック層（純粋関数のみ）
│   │   └── mahjong/              # 麻雀ロジック
│   │       ├── types/            # 型定義
│   │       │   ├── tile.ts       # 牌の型定義
│   │       │   ├── meld.ts       # 面子の型定義
│   │       │   ├── yaku.ts       # 役の型定義
│   │       │   ├── conditions.ts # 和了条件の型定義
│   │       │   └── result.ts     # 計算結果の型定義
│   │       │
│   │       ├── constants/        # 定数定義
│   │       │   ├── tiles.ts      # 牌の定数（全34種類）
│   │       │   ├── yaku.ts       # 役の定数（名前、翻数）
│   │       │   └── limits.ts     # 制限値（満貫、跳満など）
│   │       │
│   │       ├── utils/            # ユーティリティ関数
│   │       │   ├── tile-utils.ts # 牌の操作関数
│   │       │   ├── sort.ts       # ソート関数
│   │       │   └── validators.ts # バリデーション関数
│   │       │
│   │       ├── parser/           # 牌解析
│   │       │   ├── index.ts      # パーサーのエントリーポイント
│   │       │   ├── parser.ts     # 牌のパース処理
│   │       │   └── validator.ts  # 手牌のバリデーション
│   │       │
│   │       ├── decomposer/       # 面子分解
│   │       │   ├── index.ts      # デコンポーザーのエントリーポイント
│   │       │   ├── standard.ts   # 標準形の分解（4面子1雀頭）
│   │       │   ├── special.ts    # 特殊形の判定（国士、七対子等）
│   │       │   └── recursive.ts  # 再帰的分解アルゴリズム
│   │       │
│   │       ├── yaku/             # 役判定
│   │       │   ├── index.ts      # 役判定のエントリーポイント
│   │       │   ├── detector.ts   # 役判定メイン処理
│   │       │   ├── one-han/      # 1翻役
│   │       │   │   ├── riichi.ts
│   │       │   │   ├── tanyao.ts
│   │       │   │   ├── pinfu.ts
│   │       │   │   └── ...
│   │       │   ├── two-han/      # 2翻役
│   │       │   │   ├── sanshoku.ts
│   │       │   │   ├── ittsu.ts
│   │       │   │   └── ...
│   │       │   ├── yakuman/      # 役満
│   │       │   │   ├── kokushi.ts
│   │       │   │   ├── suuankou.ts
│   │       │   │   └── ...
│   │       │   └── helpers/      # 役判定ヘルパー
│   │       │       ├── sequences.ts  # 順子判定
│   │       │       └── triplets.ts   # 刻子判定
│   │       │
│   │       ├── fu/               # 符計算
│   │       │   ├── index.ts      # 符計算のエントリーポイント
│   │       │   ├── calculator.ts # 符計算メイン処理
│   │       │   ├── base-fu.ts    # 副底
│   │       │   ├── meld-fu.ts    # 面子の符
│   │       │   ├── pair-fu.ts    # 雀頭の符
│   │       │   └── wait-fu.ts    # 待ちの符
│   │       │
│   │       ├── score/            # 点数計算
│   │       │   ├── index.ts      # 点数計算のエントリーポイント
│   │       │   ├── calculator.ts # 点数計算メイン処理
│   │       │   ├── base-points.ts    # 基本点計算
│   │       │   ├── limit-hands.ts    # 満貫以上の計算
│   │       │   └── payment.ts        # 支払い計算
│   │       │
│   │       └── index.ts          # core/mahjong の公開API
│   │
│   ├── features/                 # 機能別モジュール（状態管理層 + UI層）
│   │   ├── hand-input/           # 手牌入力機能
│   │   │   ├── components/       # UIコンポーネント
│   │   │   │   ├── TileInputPanel.tsx
│   │   │   │   ├── TileSelector.tsx
│   │   │   │   ├── HandDisplay.tsx
│   │   │   │   └── TileButton.tsx
│   │   │   ├── hooks/            # カスタムフック
│   │   │   │   ├── useHandInput.ts
│   │   │   │   └── useTileSelection.ts
│   │   │   └── index.ts          # 公開API
│   │   │
│   │   ├── conditions/           # 和了条件入力機能
│   │   │   ├── components/
│   │   │   │   ├── WinningConditionsPanel.tsx
│   │   │   │   ├── ConditionCheckbox.tsx
│   │   │   │   └── WindSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWinningConditions.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── calculation/          # 点数計算機能
│   │   │   ├── components/
│   │   │   │   ├── CalculationResult.tsx
│   │   │   │   ├── YakuList.tsx
│   │   │   │   ├── FuBreakdown.tsx
│   │   │   │   ├── ScoreDisplay.tsx
│   │   │   │   └── CalculateButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCalculation.ts
│   │   │   │   └── useResultDisplay.ts
│   │   │   └── index.ts
│   │   │
│   │   └── meld-display/         # 面子分解表示機能
│   │       ├── components/
│   │       │   ├── MeldGroupDisplay.tsx
│   │       │   ├── MeldItem.tsx
│   │       │   └── WaitPattern.tsx
│   │       └── index.ts
│   │
│   ├── components/               # 共通UIコンポーネント
│   │   ├── ui/                   # 汎用UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/               # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   └── feedback/             # フィードバックコンポーネント
│   │       ├── ErrorMessage.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/                    # グローバルカスタムフック
│   │   ├── useLocalStorage.ts    # ローカルストレージ
│   │   └── useDebounce.ts        # デバウンス
│   │
│   ├── utils/                    # フロントエンド用ユーティリティ
│   │   ├── classNames.ts         # classNames結合
│   │   └── formatters.ts         # フォーマッター（数値、テキスト）
│   │
│   └── assets/                   # 静的アセット
│       ├── images/               # 画像
│       │   └── tiles/            # 牌の画像
│       └── fonts/                # フォント
│
├── tests/                        # テスト
│   ├── unit/                     # ユニットテスト
│   │   └── core/                 # core/mahjongのテスト
│   │       ├── parser.test.ts
│   │       ├── decomposer.test.ts
│   │       ├── yaku.test.ts
│   │       ├── fu.test.ts
│   │       └── score.test.ts
│   ├── integration/              # 統合テスト
│   │   └── calculation.test.ts
│   └── e2e/                      # E2Eテスト
│       └── hand-input.spec.ts
│
├── .vscode/                      # VS Code設定
│   ├── settings.json
│   └── extensions.json
│
├── public/                       # 公開ディレクトリ
│   └── logo.png
│
├── index.html                    # HTMLエントリーポイント
├── vite.config.ts                # Vite設定
├── tsconfig.json                 # TypeScript設定
├── tsconfig.node.json            # Node用TypeScript設定
├── tailwind.config.js            # Tailwind CSS設定
├── postcss.config.js             # PostCSS設定
├── eslint.config.js              # ESLint設定
├── .prettierrc                   # Prettier設定
└── package.json                  # パッケージ定義
```

---

## 各ディレクトリの役割詳細

### 1. `src/core/mahjong/` - ロジック層

**責務**: 麻雀のルールロジックを純粋関数として実装

#### 特徴

- **副作用なし**: すべて純粋関数
- **フレームワーク非依存**: React に依存しない
- **高いテスタビリティ**: ユニットテスト容易
- **再利用可能**: 他のプロジェクトでも利用可能

#### サブディレクトリ

##### `types/` - 型定義

アプリケーション全体で使用する型を定義。

**命名規則**:

- 型名は PascalCase
- ファイル名は kebab-case
- export のみ（実装なし）

**例**:

```typescript
// types/tile.ts
export type TileType = 'man' | 'pin' | 'sou' | 'wind' | 'dragon'
export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export interface Tile {
  type: TileType
  number?: TileNumber
  value?: string
  isRed?: boolean
}
```

##### `constants/` - 定数定義

マジックナンバーを排除し、定数を一元管理。

**例**:

```typescript
// constants/yaku.ts
export const YAKU_DEFINITIONS = {
  RIICHI: { name: 'リーチ', han: 1 },
  TANYAO: { name: '断么九', han: 1 },
  PINFU: { name: '平和', han: 1 },
  // ...
} as const
```

##### `utils/` - ユーティリティ関数

牌の操作、ソート、バリデーションなど汎用的な関数。

**例**:

```typescript
// utils/tile-utils.ts
export function isSameTile(a: Tile, b: Tile): boolean
export function isTerminal(tile: Tile): boolean
export function isHonor(tile: Tile): boolean
export function sortTiles(tiles: Tile[]): Tile[]
```

##### `parser/` - 牌解析

手牌の入力を解析し、内部表現に変換。

**主要関数**:

- `parseTiles()`: 牌の配列を解析
- `validateHand()`: 手牌の妥当性検証
- `normalizeHand()`: 牌の正規化（ソート等）

##### `decomposer/` - 面子分解

手牌を面子と雀頭に分解する。最も複雑なロジック。

**主要関数**:

- `decomposeMelds()`: 標準形の分解（再帰的）
- `detectSpecialForms()`: 特殊形の判定
- `getAllPatterns()`: すべての分解パターンを取得

**アルゴリズム**: バックトラッキング

##### `yaku/` - 役判定

面子分解結果から役を判定。約40種類の役に対応。

**構成**:

- `one-han/`: 1翻役（リーチ、タンヤオ等）
- `two-han/`: 2翻役（三色、一気通貫等）
- `yakuman/`: 役満（国士無双、四暗刻等）
- `helpers/`: 共通ヘルパー関数

**各役の実装**:

```typescript
// yaku/one-han/tanyao.ts
export function isTanyao(meldGroup: MeldGroup): boolean {
  // 么九牌が含まれていないか判定
  return !meldGroup.tiles.some((tile) => isTerminalOrHonor(tile))
}
```

##### `fu/` - 符計算

和了形から符を計算。

**計算要素**:

- 副底: 20符
- 面子の符: 刻子・槓子の符
- 雀頭の符: 役牌の符
- 待ちの符: 辺張・嵌張・単騎
- 和了方法の符: ツモ和了

##### `score/` - 点数計算

符と翻から最終的な点数を計算。

**計算式**:

- 基本点 = 符 × 2^(翻+2)
- 満貫以上の判定
- 親・子の支払い計算

---

### 2. `src/features/` - 機能別モジュール

**責務**: 機能単位でUI層と状態管理層をまとめる

#### 設計方針

- **Feature-based organization**: 機能ごとにフォルダを分ける
- **Colocation**: 関連するコードを近くに配置
- **自己完結**: 各機能は独立して動作可能

#### 各機能モジュールの構成

```
<feature>/
├── components/   # UIコンポーネント
├── hooks/        # カスタムフック（状態管理）
└── index.ts      # 公開API
```

##### `hand-input/` - 手牌入力機能

牌を選択して手牌を構築するUI。

**コンポーネント**:

- `TileInputPanel`: 全体のパネル
- `TileSelector`: 牌の種類選択
- `HandDisplay`: 現在の手牌表示
- `TileButton`: 個々の牌ボタン

**フック**:

- `useHandInput`: 手牌の追加・削除ロジック

##### `conditions/` - 和了条件入力

リーチ、ツモ、ドラ枚数などの条件を入力。

**コンポーネント**:

- `WinningConditionsPanel`: 条件入力パネル
- `ConditionCheckbox`: チェックボックス
- `WindSelector`: 風の選択

##### `calculation/` - 点数計算機能

計算実行と結果表示。

**フック**:

- `useCalculation`: 計算実行ロジック（core/mahjongを呼び出し）

---

### 3. `src/components/` - 共通UIコンポーネント

**責務**: 再利用可能なUIコンポーネント

#### サブディレクトリ

##### `ui/` - 汎用UIコンポーネント

ボタン、カード、チェックボックスなどの基本的なUI部品。

**設計方針**:

- Tailwind CSS でスタイリング
- プロパティで見た目をカスタマイズ可能
- アクセシビリティ対応

**例**:

```typescript
// ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}
```

##### `layout/` - レイアウトコンポーネント

ヘッダー、フッター、コンテナなど。

##### `feedback/` - フィードバックコンポーネント

エラーメッセージ、ローディング、エラーバウンダリ。

---

### 4. `src/hooks/` - グローバルカスタムフック

**責務**: アプリケーション全体で使用する汎用フック

**例**:

- `useLocalStorage`: ローカルストレージへの永続化
- `useDebounce`: 入力のデバウンス処理

---

### 5. `tests/` - テスト

#### 構成

- `unit/`: ユニットテスト（主にcore/mahjong）
- `integration/`: 統合テスト
- `e2e/`: E2Eテスト

#### テストツール

- **Vitest**: ユニット・統合テスト
- **Testing Library**: Reactコンポーネントテスト
- **Playwright**: E2Eテスト（オプション）

---

## 命名規則

### ファイル命名

| 種類                | 規則           | 例                    |
| ------------------- | -------------- | --------------------- |
| Reactコンポーネント | PascalCase.tsx | `TileSelector.tsx`    |
| フック              | use\*.ts       | `useHandInput.ts`     |
| 型定義              | kebab-case.ts  | `tile.ts`, `meld.ts`  |
| ユーティリティ      | kebab-case.ts  | `tile-utils.ts`       |
| 定数                | kebab-case.ts  | `yaku.ts`, `tiles.ts` |
| テスト              | \*.test.ts(x)  | `parser.test.ts`      |

### 変数・関数命名

| 種類                 | 規則             | 例                               |
| -------------------- | ---------------- | -------------------------------- |
| 変数                 | camelCase        | `handTiles`, `winningTile`       |
| 定数                 | UPPER_SNAKE_CASE | `MAX_TILES`, `YAKU_DEFINITIONS`  |
| 関数                 | camelCase        | `calculateScore`, `validateHand` |
| 型・インターフェース | PascalCase       | `Tile`, `MeldGroup`              |
| コンポーネント       | PascalCase       | `TileSelector`, `HandDisplay`    |

---

## インポート規則

### インポート順序

```typescript
// 1. 外部ライブラリ
import React, { useState, useEffect } from 'react'

// 2. 内部ライブラリ（core）
import { decomposeMelds, detectYaku } from '@/core/mahjong'
import type { Tile, MeldGroup } from '@/core/mahjong/types'

// 3. 機能モジュール
import { useHandInput } from '@/features/hand-input'

// 4. 共通コンポーネント
import { Button } from '@/components/ui/Button'

// 5. 相対インポート
import { TileButton } from './TileButton'

// 6. スタイル
import './styles.css'
```

### エイリアス設定

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

---

## 依存関係ルール

### レイヤー間の依存

```
UI層 (features, components)
  ↓ 許可
状態管理層 (hooks)
  ↓ 許可
ロジック層 (core)
```

### 禁止事項

- ❌ `core/` から `features/` をインポート
- ❌ `core/` から `components/` をインポート
- ❌ `core/` から React をインポート（型定義のみ例外）

### 推奨事項

- ✅ `features/` から `core/` をインポート
- ✅ `features/` から `components/` をインポート
- ✅ `components/` から他の `components/` をインポート

---

## モジュール公開API

各ディレクトリは `index.ts` で公開APIを定義。

```typescript
// core/mahjong/index.ts
export { parseTiles, validateHand } from './parser'
export { decomposeMelds } from './decomposer'
export { detectYaku } from './yaku'
export { calculateFu } from './fu'
export { calculateScore } from './score'

export type { Tile, MeldGroup, YakuItem } from './types'
```

**メリット**:

- 内部実装の隠蔽
- インポートパスの簡潔化
- リファクタリング容易性

---

## スケーラビリティ

### 新しい役の追加

```
src/core/mahjong/yaku/
└── two-han/
    └── new-yaku.ts  # ← 新しいファイルを追加

src/core/mahjong/yaku/detector.ts  # ← 役判定関数に追加
```

### 新しい機能の追加

```
src/features/
└── new-feature/  # ← 新しい機能フォルダを追加
    ├── components/
    ├── hooks/
    └── index.ts
```

---

## まとめ

このディレクトリ構成の利点:

1. **関心の分離**: UI・状態・ロジックが明確に分離
2. **テスタビリティ**: core/ は純粋関数のためテストが容易
3. **再利用性**: core/ は他のプロジェクトでも利用可能
4. **保守性**: 機能ごとにフォルダが分かれており、変更箇所が明確
5. **スケーラビリティ**: 新機能・新役の追加が容易
6. **チーム開発**: 機能ごとに開発を分担可能
