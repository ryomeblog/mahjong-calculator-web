# 麻雀点数計算アプリ - 設計書

## 概要

本ドキュメントは、React + TypeScript + Tailwind CSS で実装する麻雀点数計算Webアプリケーションの設計書です。

手牌入力から点数計算までのパイプライン処理を、UI層・状態管理層・ロジック層の3層アーキテクチャで実装します。

## プロジェクト情報

- **プロジェクト名**: mahjong-calculator-web
- **技術スタック**: React 19 + TypeScript + Vite + Tailwind CSS v5
- **アーキテクチャ**: 3層アーキテクチャ（UI層・状態管理層・ロジック層）
- **設計方針**: 純粋関数ベースのロジック層、Feature-basedのUI層

## 設計書一覧

### 1. [アーキテクチャ設計書](./architecture.md)

アプリケーション全体のアーキテクチャを定義。

**内容**:
- 3層アーキテクチャの詳細
- 各層の責務と構成
- UI層・状態管理層・ロジック層の設計
- パイプライン処理フロー
- エラーハンドリング戦略
- テスト戦略

**対象読者**: すべての開発者

**こんな時に読む**:
- プロジェクトの全体像を把握したい
- 各層の役割を理解したい
- どこに何を実装すべきか迷った時

---

### 2. [ディレクトリ構成設計書](./directory-structure.md)

プロジェクトのディレクトリ構造とファイル配置を定義。

**内容**:
- 完全なディレクトリツリー
- 各ディレクトリの役割と責務
- ファイル命名規則
- インポート規則
- 依存関係ルール
- モジュール公開API

**対象読者**: すべての開発者

**こんな時に読む**:
- 新しいファイルを作成する時
- どこにコードを配置すべきか迷った時
- 既存コードを探す時

---

### 3. [データフロー設計書](./data-flow.md)

データの流れと処理パイプラインを定義。

**内容**:
- 詳細なデータフロー図
- 手牌入力フロー
- 和了条件入力フロー
- 点数計算パイプラインの6段階
  1. 牌解析
  2. 面子分解
  3. 役判定
  4. 符計算
  5. 翻計算
  6. 点数計算
- 各段階の入出力とアルゴリズム
- エラーハンドリングフロー

**対象読者**: ロジック層を実装する開発者

**こんな時に読む**:
- ロジック層の実装を始める時
- パイプライン処理を理解したい時
- 各処理の入出力を確認したい時

---

### 4. [型定義設計書](./type-definitions.md)

TypeScriptの型定義を網羅的に定義。

**内容**:
- 基本型定義（牌、面子、役、和了条件、結果）
- ユーティリティ型
- 定数型
- Reactコンポーネント用の型
- カスタムフック用の型
- 型ガード関数
- JSONシリアライズ用の型

**対象読者**: すべての開発者

**こんな時に読む**:
- 新しい型を定義する時
- 既存の型を確認したい時
- 型エラーを解決したい時

---

## クイックスタート

### 設計書を読む順序

#### 初めてプロジェクトに参加する場合

1. **README.md（本ファイル）** - 全体像を把握
2. **architecture.md** - アーキテクチャを理解
3. **directory-structure.md** - ファイル配置を理解
4. 実装開始

#### ロジック層を実装する場合

1. **type-definitions.md** - 使用する型を確認
2. **data-flow.md** - パイプラインを理解
3. **directory-structure.md** - ファイル配置を確認
4. 実装開始

#### UI層を実装する場合

1. **architecture.md** - UI層の責務を確認
2. **directory-structure.md** - コンポーネント配置を確認
3. **type-definitions.md** - Propsの型を確認
4. 実装開始

---

## 主要な設計方針

### 1. 3層アーキテクチャ

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

**利点**:
- 関心の分離が明確
- テストが容易
- 再利用性が高い
- 保守性が高い

### 2. Feature-based Organization

機能ごとにフォルダを分ける設計。

```
src/features/
├── hand-input/      # 手牌入力機能
├── conditions/      # 和了条件入力機能
├── calculation/     # 点数計算機能
└── meld-display/    # 面子表示機能
```

**利点**:
- 機能の追加・削除が容易
- チーム開発で分担しやすい
- 関連コードが近くにある

### 3. 純粋関数ベースのロジック層

すべてのロジックを副作用のない純粋関数で実装。

```typescript
// ✅ 良い例：純粋関数
function calculateFu(meldGroup: MeldGroup): number {
  let fu = 20
  // ... 計算
  return fu
}

// ❌ 悪い例：副作用あり
function calculateFu(meldGroup: MeldGroup): void {
  setState(fu)  // 状態を変更
}
```

**利点**:
- テストが簡単
- バグが少ない
- 並行処理が可能
- 他のプロジェクトでも利用可能

### 4. 型安全性の徹底

TypeScriptの型システムを最大限活用。

```typescript
// ✅ 良い例：Union Type
type TileType = 'man' | 'pin' | 'sou' | 'wind' | 'dragon'

// ❌ 悪い例：string
type TileType = string
```

**利点**:
- コンパイル時にエラーを検出
- IDEの補完が効く
- リファクタリングが安全

---

## 実装の進め方

### Phase 1: 基盤構築

**目標**: プロジェクトの基盤を整える

**タスク**:
- [x] Vite + React + TypeScript のセットアップ
- [x] Tailwind CSS v5 のセットアップ
- [x] ESLint + Prettier のセットアップ
- [ ] ディレクトリ構造の作成
- [ ] 基本的な型定義の実装

**期間**: 1-2日

---

### Phase 2: ロジック層の実装

**目標**: 麻雀のルールロジックを実装

**タスク**:

#### 2.1 基本型定義
- [ ] `types/tile.ts` - 牌の型定義
- [ ] `types/meld.ts` - 面子の型定義
- [ ] `types/yaku.ts` - 役の型定義
- [ ] `types/conditions.ts` - 和了条件の型定義
- [ ] `types/result.ts` - 計算結果の型定義

#### 2.2 パーサー
- [ ] `parser/parser.ts` - 牌の解析
- [ ] `parser/validator.ts` - バリデーション
- [ ] テストコード

#### 2.3 面子分解
- [ ] `decomposer/standard.ts` - 標準形の分解
- [ ] `decomposer/special.ts` - 特殊形の判定
- [ ] `decomposer/recursive.ts` - 再帰的分解
- [ ] テストコード（最重要）

#### 2.4 役判定
- [ ] `yaku/detector.ts` - 役判定メイン
- [ ] `yaku/one-han/` - 1翻役（10種類程度）
- [ ] `yaku/two-han/` - 2翻役（10種類程度）
- [ ] `yaku/yakuman/` - 役満（10種類程度）
- [ ] テストコード

#### 2.5 符・翻・点数計算
- [ ] `fu/calculator.ts` - 符計算
- [ ] `score/calculator.ts` - 点数計算
- [ ] テストコード

**期間**: 1-2週間

**優先順位**:
1. パーサー（他の実装の基盤）
2. 面子分解（最も複雑）
3. 役判定（最も時間がかかる）
4. 符・点数計算（比較的簡単）

---

### Phase 3: 状態管理層の実装

**目標**: React Hooks でアプリケーション状態を管理

**タスク**:
- [ ] `hooks/useHandInput.ts` - 手牌入力
- [ ] `hooks/useWinningConditions.ts` - 和了条件
- [ ] `hooks/useCalculation.ts` - 計算実行
- [ ] テストコード

**期間**: 2-3日

---

### Phase 4: UI層の実装

**目標**: ユーザーインターフェースを構築

**タスク**:

#### 4.1 共通UIコンポーネント
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/Checkbox.tsx`

#### 4.2 機能コンポーネント
- [ ] `features/hand-input/` - 手牌入力UI
- [ ] `features/conditions/` - 和了条件入力UI
- [ ] `features/calculation/` - 計算結果表示UI
- [ ] `features/meld-display/` - 面子表示UI

**期間**: 1週間

---

### Phase 5: 統合とテスト

**目標**: 全体の統合とテスト

**タスク**:
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] パフォーマンス最適化
- [ ] バグフィックス

**期間**: 3-5日

---

## 開発時の注意点

### Do's（推奨事項）

- ✅ **小さく始める**: 最小限の機能から実装
- ✅ **テストを書く**: 特にロジック層は必須
- ✅ **型を厳密に**: any は使わない
- ✅ **コメントを書く**: 複雑なロジックには説明を
- ✅ **設計書を更新**: 実装と設計が乖離しないように

### Don'ts（禁止事項）

- ❌ **core/ から React をインポート**: ロジック層は純粋関数のみ
- ❌ **マジックナンバー**: 定数は constants/ に
- ❌ **巨大な関数**: 1関数は50行以内を目安に
- ❌ **副作用のあるロジック**: 純粋関数を保つ
- ❌ **未テストコード**: ロジック層は必ずテスト

---

## よくある質問（FAQ）

### Q1: 新しい役を追加するには？

**A**: 以下の手順で追加できます。

1. `src/core/mahjong/yaku/` に新しいファイルを作成
2. 役判定関数を実装
3. `src/core/mahjong/yaku/detector.ts` に追加
4. `src/core/mahjong/constants/yaku.ts` に定義を追加
5. テストを書く

詳細は [directory-structure.md](./directory-structure.md#スケーラビリティ) を参照。

---

### Q2: 面子分解のアルゴリズムは？

**A**: バックトラッキングによる再帰的探索を使用。

詳細は [data-flow.md - Stage 2: decomposeMelds](./data-flow.md#stage-2-decomposemelds-面子分解) を参照。

---

### Q3: エラーハンドリングはどうする？

**A**: 各層で適切にエラーを処理。

- **ロジック層**: バリデーションエラーは例外をthrow
- **状態管理層**: try-catchでキャッチしerror状態に格納
- **UI層**: ErrorBoundaryで全体をキャッチ

詳細は [architecture.md - エラーハンドリング](./architecture.md#5-エラーハンドリング) を参照。

---

### Q4: ローカルルール（赤ドラなど）に対応するには？

**A**: `WinningConditions` 型を拡張。

```typescript
interface WinningConditions {
  // ... 既存のフィールド
  redDoraCount: number  // 赤ドラ枚数を追加
}
```

詳細は [architecture.md - 拡張性](./architecture.md#8-拡張性) を参照。

---

### Q5: パフォーマンスが遅い場合は？

**A**: 以下の最適化を検討。

1. 面子分解結果のメモ化
2. 重い計算を Web Worker に移動
3. React.memo でコンポーネントをメモ化

詳細は [architecture.md - パフォーマンス最適化](./architecture.md#6-パフォーマンス最適化) を参照。

---

## 参考資料

### 麻雀ルール
- 日本プロ麻雀連盟ルール
- 天鳳ルール（オンライン麻雀）

### 技術資料
- [React 公式ドキュメント](https://react.dev/)
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/)
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/)
- [Vite 公式ドキュメント](https://vitejs.dev/)

---

## まとめ

本設計書に従って実装することで、以下のような高品質なアプリケーションを構築できます：

1. **保守性が高い**: 明確な責務分離と3層アーキテクチャ
2. **テスタビリティが高い**: 純粋関数ベースのロジック層
3. **拡張性が高い**: Feature-basedの構成と依存関係ルール
4. **型安全**: TypeScriptの型システムを最大限活用
5. **チーム開発に適している**: 機能単位で開発を分担可能

設計書は実装と共に進化します。実装中に新しい知見が得られたら、随時このドキュメントを更新してください。

---

**最終更新日**: 2026-01-18
