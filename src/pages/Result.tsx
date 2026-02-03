/**
 * 結果画面（SVGデザイン準拠）
 */

import { useState, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  IoArrowBack,
  IoChevronDown,
  IoChevronUp,
  IoShareSocialOutline,
  IoClose,
  IoCopyOutline,
} from 'react-icons/io5'
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
import {
  searchParamsToLocationState,
  locationStateToSearchParams,
  type ParseResult,
} from '@/utils/urlSerializer'

interface LocationState {
  tiles: readonly TileType[]
  winningTile: TileType
  handSlots?: import('@/components/tiles/HandStructureInput').MeldSlot[] | null
  handGroups?: readonly (readonly TileType[])[]
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
  const [searchParams] = useSearchParams()

  // location.state 優先、なければクエリパラメータからデシリアライズ
  const hasQueryParams = searchParams.has('h')
  const resolved = useMemo<{
    state: LocationState | null
    error: string | null
  }>(() => {
    const locState = location.state as LocationState | null
    if (locState?.tiles && locState?.winningTile) {
      return { state: locState, error: null }
    }
    if (!hasQueryParams) {
      return { state: null, error: null }
    }
    const result: ParseResult = searchParamsToLocationState(searchParams)
    if (result.ok) {
      return { state: result.state, error: null }
    }
    return { state: null, error: result.error }
  }, [location.state, searchParams, hasQueryParams])

  const state = resolved.state

  // 役アコーディオンの状態（Hooksは早期returnの前に宣言）
  const [isYakuOpen, setIsYakuOpen] = useState(true)
  const [isShareOpen, setIsShareOpen] = useState(false)

  if (resolved.error) {
    return <ErrorScreen message={resolved.error} navigate={navigate} />
  }

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

  // ドラ表示牌から実際のドラ牌を特定するヘルパー関数
  const getDoraFromIndicator = (indicator: TileType): TileType | null => {
    if (
      indicator.type === 'man' ||
      indicator.type === 'pin' ||
      indicator.type === 'sou'
    ) {
      const nextNumber = indicator.number === 9 ? 1 : indicator.number! + 1
      return { type: indicator.type, number: nextNumber as TileType['number'] }
    }
    if (indicator.type === 'wind') {
      const windOrder = ['east', 'south', 'west', 'north'] as const
      const currentIndex = windOrder.indexOf(indicator.wind!)
      const nextWind = windOrder[(currentIndex + 1) % 4]
      return { type: 'wind', wind: nextWind }
    }
    if (indicator.type === 'dragon') {
      const dragonOrder = ['white', 'green', 'red'] as const
      const currentIndex = dragonOrder.indexOf(indicator.dragon!)
      const nextDragon = dragonOrder[(currentIndex + 1) % 3]
      return { type: 'dragon', dragon: nextDragon }
    }
    return null
  }

  // 手牌中のドラ枚数をカウント
  const isTileMatch = (a: TileType, b: TileType): boolean => {
    if (a.type !== b.type) return false
    if (a.type === 'man' || a.type === 'pin' || a.type === 'sou')
      return a.number === b.number
    if (a.type === 'wind') return a.wind === b.wind
    if (a.type === 'dragon') return a.dragon === b.dragon
    return false
  }

  const countDoraInHand = (indicators: readonly TileType[]): number => {
    let count = 0
    for (const indicator of indicators) {
      const doraTile = getDoraFromIndicator(indicator)
      if (!doraTile) continue
      count += tiles.filter((t) => isTileMatch(t, doraTile)).length
    }
    return count
  }

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
    doraCount: countDoraInHand(doraTiles),
    uraDoraCount: countDoraInHand(uraDoraTiles),
    redDoraCount,
  }

  // 手牌枚数バリデーション
  if (tiles.length !== 14) {
    return (
      <ErrorScreen
        message={`手牌は14枚である必要があります（現在${tiles.length}枚）`}
        navigate={navigate}
      />
    )
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
        <div
          onClick={() => navigate('/', { state })}
          className="absolute top-4 left-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          <IoArrowBack size={18} />
        </div>
        <h1 className="flex-1 text-center text-xl font-bold text-slate-50">
          計算結果
        </h1>
        <div
          onClick={() => setIsShareOpen(true)}
          className="absolute top-4 right-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          <IoShareSocialOutline size={18} />
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
                const isDora = yaku.displayName.includes('ドラ')
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${isDora ? 'bg-red-500' : 'bg-blue-500'}`}
                      />
                      <span className="text-sm text-slate-50">
                        {yaku.displayName}
                      </span>
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
            handGroups={state.handGroups}
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

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={`https://ryomeblog.github.io/mahjong-calculator-web/result?${locationStateToSearchParams(state).toString()}`}
        shareText={`麻雀点数計算 - ${totalScore.toLocaleString()}点（${han}翻${fuCalculation.total}符）`}
      />
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

// 共有モーダルコンポーネント
interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  shareText: string
}

function ShareModal({ isOpen, onClose, shareUrl, shareText }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [discordCopied, setDiscordCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDiscordCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    setDiscordCopied(true)
    setTimeout(() => setDiscordCopied(false), 2000)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-50">共有</h2>
          <div
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
          >
            <IoClose size={24} />
          </div>
        </div>

        {/* SNSボタン */}
        <div className="mb-6 flex gap-3">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-slate-700 p-4 transition-colors hover:bg-slate-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
              <span className="text-sm font-bold text-white">𝕏</span>
            </div>
            <span className="text-xs text-slate-400">X</span>
          </a>
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-slate-700 p-4 transition-colors hover:bg-slate-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06C755]">
              <span className="text-sm font-bold text-white">LINE</span>
            </div>
            <span className="text-xs text-slate-400">LINE</span>
          </a>
          <button
            type="button"
            onClick={handleDiscordCopy}
            className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-slate-700 p-4 transition-colors hover:bg-slate-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2]">
              <span className="text-xs font-bold text-white">DC</span>
            </div>
            <span className="text-xs text-slate-400">
              {discordCopied ? 'コピーしました' : 'Discord'}
            </span>
          </button>
        </div>

        {/* URLコピーセクション */}
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-400">
            {shareUrl}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-slate-600"
          >
            <IoCopyOutline size={14} />
            {copied ? 'コピーしました' : 'コピー'}
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

// 手牌表示コンポーネント
function HandDisplay({
  winningTile,
  handSlots,
  handGroups,
  doraTiles,
  uraDoraTiles,
}: {
  meldGroup: MeldGroup
  winningTile: TileType
  tiles: readonly TileType[]
  handSlots?: import('@/components/tiles/HandStructureInput').MeldSlot[] | null
  handGroups?: readonly (readonly TileType[])[]
  doraTiles?: readonly TileType[]
  uraDoraTiles?: readonly TileType[]
}) {
  // ドラ牌かどうかを判定するヘルパー関数
  // ドラ表示牌の次の牌がドラ
  const isDoraIndicator = (tile: TileType): boolean => {
    if (!doraTiles && !uraDoraTiles) return false

    const allDoraIndicators = [...(doraTiles || []), ...(uraDoraTiles || [])]

    return allDoraIndicators.some((indicator) => {
      if (indicator.type !== tile.type) return false

      if (
        indicator.type === 'man' ||
        indicator.type === 'pin' ||
        indicator.type === 'sou'
      ) {
        if (tile.type !== indicator.type) return false
        const nextNumber = indicator.number === 9 ? 1 : indicator.number! + 1
        return tile.number === nextNumber
      }

      if (indicator.type === 'wind') {
        if (tile.type !== 'wind') return false
        const windOrder = ['east', 'south', 'west', 'north'] as const
        const currentIndex = windOrder.indexOf(indicator.wind!)
        const nextWind = windOrder[(currentIndex + 1) % 4]
        return tile.wind === nextWind
      }

      if (indicator.type === 'dragon') {
        if (tile.type !== 'dragon') return false
        const dragonOrder = ['white', 'green', 'red'] as const
        const currentIndex = dragonOrder.indexOf(indicator.dragon!)
        const nextDragon = dragonOrder[(currentIndex + 1) % 3]
        return tile.dragon === nextDragon
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

  // handGroups または手牌13枚 + 和了牌を右端に表示
  // handGroupsがない場合は全13枚を1グループとして表示
  const groups: readonly (readonly TileType[])[] = handGroups ?? []

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 手牌グループ（13枚） */}
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {group.map((tile, tileIndex) => (
            <Tile
              key={tileIndex}
              tile={tile}
              size="small"
              isDora={isDoraIndicator(tile)}
            />
          ))}
        </div>
      ))}

      {/* 和了牌（右端） */}
      <div className="flex items-center gap-0.5">
        <Tile
          tile={winningTile}
          size="small"
          isWinning
          isDora={isDoraIndicator(winningTile)}
        />
      </div>
    </div>
  )
}
