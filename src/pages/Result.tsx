/**
 * 結果画面（SVGデザイン準拠）
 */

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IoArrowBack, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { Tile } from '@/components/tiles/Tile'
import {
  decomposeStandard,
  detectSpecialForms,
  detectYaku,
  calculateHan,
  calculateFu,
  calculateScore,
  type Tile as TileType,
  type Wind,
  type WinningConditions,
  type MeldGroup,
  type SpecialForm,
} from '@/core/mahjong'

interface LocationState {
  tiles: readonly TileType[]
  winningTile: TileType
  handSlots?: import('@/components/tiles/HandStructureInput').MeldSlot[] | null
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  roundWind: Wind
  seatWind: Wind
  isDealer: boolean
  doraTiles?: readonly TileType[]
  uraDoraTiles?: readonly TileType[]
  honba?: number
  isIppatsu?: boolean
  isChankan?: boolean
  isRinshan?: boolean
  isHaitei?: boolean
  isHoutei?: boolean
  isTenhou?: boolean
  isChiihou?: boolean
}

export function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  // 役アコーディオンの状態（Hooksは早期returnの前に宣言）
  const [isYakuOpen, setIsYakuOpen] = useState(true)

  if (!state || !state.tiles || !state.winningTile) {
    navigate('/')
    return null
  }

  const {
    tiles,
    winningTile,
    handSlots,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    roundWind,
    seatWind,
    isDealer,
    doraTiles = [],
    uraDoraTiles = [],
    honba = 0,
    isIppatsu = false,
    isChankan = false,
    isRinshan = false,
    isHaitei = false,
    isHoutei = false,
    isTenhou = false,
    isChiihou = false,
  } = state

  // 赤ドラカウント
  const redDoraCount = tiles.filter((t) => t.isRed).length

  // 和了条件
  const conditions: WinningConditions = {
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    isIppatsu,
    isChankan,
    isRinshan,
    isHaitei,
    isHoutei,
    isTenhou,
    isChiihou,
    prevailingWind: roundWind,
    seatWind,
    isDealer,
    doraCount: doraTiles.length,
    uraDoraCount: uraDoraTiles.length,
    redDoraCount,
  }

  // 特殊形を先にチェック（七対子、国士無双）
  const specialForms = detectSpecialForms(tiles, winningTile)

  // 特殊形がある場合はそれを使用、なければ標準形で分解
  let meldGroup: MeldGroup
  let yakuList: ReturnType<typeof detectYaku>
  let specialForm: SpecialForm | null = null

  if (specialForms.length > 0) {
    // 特殊形（七対子、国士無双）の場合
    specialForm = specialForms[0]
    // SpecialFormをMeldGroupに変換（ダミーの面子構成を作成）
    meldGroup = convertSpecialFormToMeldGroup(specialForm)
    yakuList = detectYaku(meldGroup, conditions)
  } else {
    // 標準形の場合
    const meldGroups = decomposeStandard(tiles, winningTile)

    if (meldGroups.length === 0) {
      return (
        <ErrorScreen message="面子分解に失敗しました" navigate={navigate} />
      )
    }

    meldGroup = meldGroups[0]
    yakuList = detectYaku(meldGroup, conditions)
  }

  if (yakuList.length === 0) {
    return (
      <ErrorScreen
        message="役がありません（和了形ですが役なし）"
        navigate={navigate}
      />
    )
  }

  // 翻数・符・点数計算
  const han = calculateHan(yakuList, conditions)
  const fuCalculation = calculateFu(meldGroup, conditions)
  const scoreCalculation = calculateScore(fuCalculation, han, conditions)

  // 合計点数と支払い内訳を計算
  let totalScore = 0
  let dealerPayment = 0
  let nonDealerPayment = 0

  if (isTsumo) {
    if (isDealer) {
      // 親がツモ：各子が同額を払う
      const eachPayment = scoreCalculation.payment.tsumoEach || 0
      totalScore = eachPayment * 3
      dealerPayment = 0 // 親は払わない
      nonDealerPayment = eachPayment
    } else {
      // 子がツモ：親と子で異なる額
      dealerPayment = scoreCalculation.payment.tsumoDealer || 0
      nonDealerPayment = scoreCalculation.payment.tsumoNonDealer || 0
      totalScore = dealerPayment + nonDealerPayment * 2
    }
  } else {
    // ロン：ロン和了の点数
    totalScore = scoreCalculation.payment.ron || 0
  }

  // 役を小さい順にソート
  const sortedYakuList = [...yakuList].sort((a, b) => a.han - b.han)

  // 場風・自風の文字
  const windChars: Record<Wind, string> = {
    east: '東',
    south: '南',
    west: '西',
    north: '北',
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ヘッダー */}
      <header className="relative flex h-16 items-center bg-slate-800 px-5">
        <h1 className="flex-1 text-center text-xl font-bold text-slate-50">
          計算結果
        </h1>
        <div
          onClick={() => navigate('/')}
          className="absolute top-4 right-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          <IoArrowBack size={18} />
        </div>
      </header>

      <div className="container-responsive space-y-5 px-5 py-5">
        {/* メインスコア表示 */}
        <div className="relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6">
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-5xl font-bold text-white">
              {totalScore.toLocaleString()}
              <span className="ml-1 text-xl">点</span>
            </p>
            <div className="mt-3 rounded-full bg-blue-800/50 px-4 py-1">
              <p className="text-sm font-semibold text-white">
                {han}翻 {fuCalculation.total}符
              </p>
            </div>
          </div>
        </div>

        {/* 支払い内訳（ツモの場合） */}
        {isTsumo && scoreCalculation.payment && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-400">
              支払い内訳
            </h3>
            <div className="space-y-3 rounded-xl bg-slate-800 p-5">
              {isDealer ? (
                /* 親がツモ：子 × 3 */
                <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700">
                      <span className="text-xs font-semibold text-slate-400">
                        子
                      </span>
                    </div>
                    <span className="text-sm text-slate-300">子 × 3</span>
                  </div>
                  <span className="text-base font-semibold text-white">
                    {nonDealerPayment.toLocaleString()}点
                  </span>
                </div>
              ) : (
                /* 子がツモ：親 × 1、子 × 2 */
                <>
                  <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                        <span className="text-xs font-semibold text-white">
                          東
                        </span>
                      </div>
                      <span className="text-sm text-slate-300">親 × 1</span>
                    </div>
                    <span className="text-base font-semibold text-white">
                      {dealerPayment.toLocaleString()}点
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700">
                        <span className="text-xs font-semibold text-slate-400">
                          子
                        </span>
                      </div>
                      <span className="text-sm text-slate-300">子 × 2</span>
                    </div>
                    <span className="text-base font-semibold text-white">
                      {nonDealerPayment.toLocaleString()}点
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 役の詳細（アコーディオン） */}
        <div className="overflow-hidden rounded-xl bg-slate-800">
          <button
            type="button"
            onClick={() => setIsYakuOpen(!isYakuOpen)}
            className="flex w-full items-center justify-between p-5 transition-colors hover:bg-slate-700"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-400">役の詳細</h3>
              {scoreCalculation.limitHandName ? (
                <span className="text-lg font-bold text-yellow-400">
                  {scoreCalculation.limitHandName === 'yakuman'
                    ? '役満'
                    : scoreCalculation.limitHandName === 'double-yakuman'
                      ? 'ダブル役満'
                      : scoreCalculation.limitHandName === 'triple-yakuman'
                        ? 'トリプル役満'
                        : scoreCalculation.limitHandName === 'mangan'
                          ? '満貫'
                          : scoreCalculation.limitHandName === 'haneman'
                            ? '跳満'
                            : scoreCalculation.limitHandName === 'baiman'
                              ? '倍満'
                              : scoreCalculation.limitHandName === 'sanbaiman'
                                ? '三倍満'
                                : ''}
                </span>
              ) : (
                <span className="text-lg font-bold text-blue-400">{han}翻</span>
              )}
            </div>
            {isYakuOpen ? (
              <IoChevronUp className="text-slate-400" size={20} />
            ) : (
              <IoChevronDown className="text-slate-400" size={20} />
            )}
          </button>
          {isYakuOpen && (
            <div className="space-y-3 px-5 pt-6 pb-5">
              {sortedYakuList.map((yaku, index) => {
                const isDora = yaku.name.includes('ドラ')
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${isDora ? 'bg-red-500' : 'bg-blue-500'}`}
                      />
                      <span className="text-sm text-slate-50">{yaku.name}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${isDora ? 'text-red-400' : 'text-blue-400'}`}
                    >
                      {yaku.han}翻
                    </span>
                  </div>
                )
              })}
              {/* ドラ・役満情報 */}
              {(conditions.doraCount > 0 ||
                conditions.uraDoraCount > 0 ||
                conditions.redDoraCount > 0 ||
                scoreCalculation.limitHandName) && (
                <>
                  {conditions.doraCount > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm text-slate-50">ドラ</span>
                      </div>
                      <span className="text-sm font-semibold text-red-400">
                        {conditions.doraCount}翻
                      </span>
                    </div>
                  )}
                  {conditions.uraDoraCount > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm text-slate-50">裏ドラ</span>
                      </div>
                      <span className="text-sm font-semibold text-red-400">
                        {conditions.uraDoraCount}翻
                      </span>
                    </div>
                  )}
                  {conditions.redDoraCount > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm text-slate-50">赤ドラ</span>
                      </div>
                      <span className="text-sm font-semibold text-red-400">
                        {conditions.redDoraCount}翻
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 手牌の構成 */}
        <div className="rounded-xl bg-slate-800 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-400">
            手牌の構成
          </h3>
          <HandDisplay
            meldGroup={meldGroup}
            winningTile={winningTile}
            tiles={tiles}
            handSlots={handSlots}
            doraTiles={doraTiles}
            uraDoraTiles={uraDoraTiles}
          />
        </div>

        {/* 局情報 */}
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-800 p-5">
          <div>
            <p className="mb-1 text-xs text-slate-500">局情報</p>
            <p className="text-sm text-slate-300">
              {windChars[roundWind]}
              {isDealer ? '1' : '2'}局 {honba}本場
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">和了方法</p>
            <p className="text-sm text-slate-300">
              {isTsumo ? 'ツモ' : 'ロン'}
              {isRiichi && '・リーチ'}
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/', { state })}
            className="flex-1 rounded-xl bg-slate-700 py-3.5 text-sm text-slate-300 hover:bg-slate-600"
          >
            修正する
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            新規計算
          </button>
        </div>
      </div>
    </div>
  )
}

// エラー画面コンポーネント
function ErrorScreen({
  message,
  navigate,
}: {
  message: string
  navigate: (path: string) => void
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="flex h-16 items-center bg-slate-800 px-5">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-slate-300"
        >
          <IoArrowBack size={20} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-slate-50">
          エラー
        </h1>
        <div className="w-9" />
      </header>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-5">
        <div className="w-full max-w-md rounded-xl bg-slate-800 p-8 text-center">
          <h2 className="mb-4 text-xl font-bold text-red-400">{message}</h2>
          <p className="mb-6 text-sm text-slate-400">
            正しい手牌を入力してください。
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * SpecialFormをMeldGroupに変換（七対子・国士無双用のダミー面子構成）
 */
function convertSpecialFormToMeldGroup(specialForm: SpecialForm): MeldGroup {
  const { tiles, winningTile, type } = specialForm

  // ダミーの雀頭を作成（最初の2枚）
  const dummyPair: MeldGroup['pair'] = {
    type: 'pair',
    tiles: [tiles[0], tiles[1]],
    isConcealed: true,
  }

  // ダミーの面子を作成（残りの牌を3枚ずつに分割）
  const dummyMelds: MeldGroup['melds'] = [
    {
      type: 'sequence',
      tiles: [tiles[2], tiles[3], tiles[4]],
      isConcealed: true,
    },
    {
      type: 'sequence',
      tiles: [tiles[5], tiles[6], tiles[7]],
      isConcealed: true,
    },
    {
      type: 'sequence',
      tiles: [tiles[8], tiles[9], tiles[10]],
      isConcealed: true,
    },
    {
      type: 'sequence',
      tiles: [tiles[11], tiles[12], tiles[13]],
      isConcealed: true,
    },
  ]

  return {
    melds: dummyMelds,
    pair: dummyPair,
    wait: 'tanki',
    winningTile,
    isSpecial: true,
    specialType: type,
  }
}

// 手牌表示コンポーネント（ホーム画面と同じ表示）
function HandDisplay({
  meldGroup,
  handSlots,
  doraTiles,
  uraDoraTiles,
}: {
  meldGroup: MeldGroup
  winningTile: TileType
  tiles: readonly TileType[]
  handSlots?: import('@/components/tiles/HandStructureInput').MeldSlot[] | null
  doraTiles?: readonly TileType[]
  uraDoraTiles?: readonly TileType[]
}) {
  // ドラ牌かどうかを判定するヘルパー関数
  const isDoraIndicator = (tile: TileType): boolean => {
    if (!doraTiles && !uraDoraTiles) return false

    const allDoraTiles = [...(doraTiles || []), ...(uraDoraTiles || [])]

    return allDoraTiles.some((dora) => {
      if (dora.type !== tile.type) return false
      if (dora.isRed !== tile.isRed) return false

      // 数牌の場合
      if (dora.type === 'man' || dora.type === 'pin' || dora.type === 'sou') {
        return dora.number === tile.number
      }

      // 風牌の場合
      if (dora.type === 'wind') {
        return dora.wind === tile.wind
      }

      // 三元牌の場合
      if (dora.type === 'dragon') {
        return dora.dragon === tile.dragon
      }

      return false
    })
  }

  // handSlotsがある場合はそれを使って表示（鳴き牌情報を含む）
  if (handSlots) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {handSlots.map((slot, slotIndex) => {
          const hasTiles = slot.tiles.some((t) => t !== null)
          if (!hasTiles) return null

          return (
            <div key={slotIndex} className="flex items-center gap-0.5">
              {slot.tiles.map((tile, tileIndex) => {
                if (!tile) return null
                const isSideways = slot.sidewaysTiles?.has(tileIndex) || false
                const isWinningTileCheck =
                  slotIndex === handSlots.length - 1 && tileIndex === 0
                const isDora = isDoraIndicator(tile)
                return (
                  <div
                    key={tileIndex}
                    className={isSideways ? 'rotate-90 transform' : ''}
                  >
                    <Tile
                      tile={tile}
                      size="small"
                      isWinning={isWinningTileCheck}
                      isDora={isDora}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  // handSlotsがない場合は面子分解結果を表示
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 雀頭を最初に表示 */}
      <div className="flex items-center gap-0.5">
        {meldGroup.pair.tiles.map((tile, index) => {
          const isDora = isDoraIndicator(tile)
          return <Tile key={index} tile={tile} size="small" isDora={isDora} />
        })}
      </div>

      {/* 面子を表示 */}
      {meldGroup.melds.map((meld, index) => (
        <div key={index} className="flex items-center gap-0.5">
          {meld.tiles.map((tile, tileIndex) => {
            const isDora = isDoraIndicator(tile)
            return (
              <Tile key={tileIndex} tile={tile} size="small" isDora={isDora} />
            )
          })}
        </div>
      ))}
    </div>
  )
}
