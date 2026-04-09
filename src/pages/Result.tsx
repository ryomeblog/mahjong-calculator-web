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
  detectWaitType,
  calculateHan,
  calculateFu,
  calculateScore,
  type Tile as TileType,
  type Wind,
  type WinningConditions,
  type Meld,
  type MeldGroup,
  type Pair,
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
  openGroups?: readonly number[]
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

  // 手牌枚数バリデーション（カン含む場合は14-18枚）
  if (tiles.length < 14 || tiles.length > 18) {
    return (
      <ErrorScreen
        message={`手牌は14〜18枚である必要があります（現在${tiles.length}枚）`}
        navigate={navigate}
      />
    )
  }

  // カンを含むかどうか（14枚以上）
  const hasKan = tiles.length > 14

  // 鳴き面子の牌グループを取得
  const openMeldTiles = getOpenMeldTiles(
    handSlots,
    state.openGroups,
    state.handGroups
  )

  // 特殊形を先にチェック（七対子、国士無双）- カンの場合はスキップ
  const specialForms = hasKan ? [] : detectSpecialForms(tiles, winningTile)

  // 候補となるMeldGroupを全て集めて、最高得点のものを採用する
  type Candidate = {
    meldGroup: MeldGroup
    yakuList: ReturnType<typeof detectYaku>
    han: number
    fu: ReturnType<typeof calculateFu>
    score: ReturnType<typeof calculateScore>
    specialForm: SpecialForm | null
  }

  const candidates: Candidate[] = []

  const evaluate = (
    mg: MeldGroup,
    sf: SpecialForm | null
  ): Candidate | null => {
    try {
      const yl = detectYaku(mg, conditions)
      if (yl.length === 0) return null
      const h = calculateHan(yl, conditions)
      const fc = calculateFu(mg, conditions)
      const sc = calculateScore(fc, h, conditions)
      return {
        meldGroup: mg,
        yakuList: yl,
        han: h,
        fu: fc,
        score: sc,
        specialForm: sf,
      }
    } catch {
      return null
    }
  }

  if (hasKan && state.handGroups) {
    // カンを含む手牌: handGroupsから直接MeldGroupを構築
    const builtGroup = buildMeldGroupFromGroups(
      state.handGroups,
      winningTile,
      openMeldTiles
    )
    if (!builtGroup) {
      return (
        <ErrorScreen
          message="カンを含む手牌の面子構成に失敗しました"
          navigate={navigate}
        />
      )
    }
    const c = evaluate(builtGroup, null)
    if (c) candidates.push(c)
  } else {
    // 標準形の全ての分解を試す
    const meldGroups = decomposeStandard(tiles, winningTile)
    for (const mg of meldGroups) {
      const applied = applyOpenMelds(mg, openMeldTiles)
      const c = evaluate(applied, null)
      if (c) candidates.push(c)
    }

    // 特殊形（七対子・国士無双）の候補も加える
    for (const sf of specialForms) {
      const mg = convertSpecialFormToMeldGroup(sf)
      const c = evaluate(mg, sf)
      if (c) candidates.push(c)
    }
  }

  if (candidates.length === 0) {
    // 分解は成立しているが役がない、または分解自体が失敗した場合
    const hasAnyDecomposition =
      specialForms.length > 0 ||
      (!hasKan && decomposeStandard(tiles, winningTile).length > 0) ||
      (hasKan && state.handGroups)

    if (!hasAnyDecomposition) {
      return (
        <ErrorScreen message="面子分解に失敗しました" navigate={navigate} />
      )
    }
    return (
      <ErrorScreen
        message="役がありません（和了形ですが役なし）"
        navigate={navigate}
      />
    )
  }

  // 最高得点の候補を選択
  // 比較基準: 役満 > 翻数 > 符 > basePoints
  const best = candidates.reduce((a, b) => {
    const aIsYakuman = a.yakuList.some((y) => y.isYakuman)
    const bIsYakuman = b.yakuList.some((y) => y.isYakuman)
    if (aIsYakuman !== bIsYakuman) return aIsYakuman ? a : b
    if (a.han !== b.han) return a.han > b.han ? a : b
    if (a.fu.total !== b.fu.total) return a.fu.total > b.fu.total ? a : b
    return a.score.basePoints >= b.score.basePoints ? a : b
  })

  const meldGroup: MeldGroup = best.meldGroup
  const yakuList = best.yakuList
  const han = best.han
  const fuCalculation = best.fu
  const scoreCalculation = best.score

  // 合計点数と支払い内訳を計算（本場＝honba を考慮）
  let totalScore = 0
  let dealerPayment = 0
  let nonDealerPayment = 0

  if (isTsumo) {
    if (isDealer) {
      // 親がツモ：各子が同額を払う
      let eachPayment = scoreCalculation.payment.tsumoEach || 0
      // 本場加算: 各子は honba ごとに +100 を支払う
      eachPayment += honba * 100
      totalScore = eachPayment * 3
      dealerPayment = 0 // 親は払わない
      nonDealerPayment = eachPayment
    } else {
      // 子がツモ：親と子で異なる額
      let dp = scoreCalculation.payment.tsumoDealer || 0
      let ndp = scoreCalculation.payment.tsumoNonDealer || 0
      // 本場加算: 親・子ともに honba ごとに +100 を支払う
      dp += honba * 100
      ndp += honba * 100
      dealerPayment = dp
      nonDealerPayment = ndp
      totalScore = dealerPayment + nonDealerPayment * 2
    }
  } else {
    // ロン：ロン和了の点数
    let ron = scoreCalculation.payment.ron || 0
    // 本場加算: 放銃者は honba ごとに +300 を支払う
    ron += honba * 300
    totalScore = ron
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
          onClick={() => {
            // デバッグログ: Result から Home に戻る際の honba 情報
            navigate('/', { state })
          }}
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
            onClick={() => {
              navigate('/', { state })
            }}
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

// 牌を一意に識別するキー生成
function tileKey(t: TileType): string {
  if (t.type === 'man' || t.type === 'pin' || t.type === 'sou') {
    return `${t.type}${t.number}${t.isRed ? 'r' : ''}`
  }
  if (t.type === 'wind') return `wind-${t.wind}`
  if (t.type === 'dragon') return `dragon-${t.dragon}`
  return 'unknown'
}

// 面子の牌キーをソートして結合
function meldTileKey(tiles: readonly TileType[]): string {
  return [...tiles].map(tileKey).sort().join('+')
}

// handSlots または openGroups + handGroups から鳴き面子の牌グループを取得
function getOpenMeldTiles(
  handSlots:
    | import('@/components/tiles/HandStructureInput').MeldSlot[]
    | null
    | undefined,
  openGroups: readonly number[] | undefined,
  handGroups: readonly (readonly TileType[])[] | undefined
): readonly TileType[][] {
  // handSlots がある場合（直接ナビゲーション）
  if (handSlots && handSlots.length > 1) {
    const result: TileType[][] = []
    const meldSlots = handSlots.slice(0, -1) // 和了牌スロットを除く
    for (const slot of meldSlots) {
      if (slot.sidewaysTiles && slot.sidewaysTiles.size > 0) {
        const tiles = slot.tiles.filter((t): t is TileType => t !== null)
        if (tiles.length > 0) {
          result.push(tiles)
        }
      }
    }
    return result
  }

  // openGroups + handGroups がある場合（URL経由）
  if (openGroups && openGroups.length > 0 && handGroups) {
    return openGroups
      .filter((idx) => idx >= 0 && idx < handGroups.length)
      .map((idx) => [...handGroups[idx]])
  }

  return []
}

// 分解結果に鳴き面子の情報を反映
function applyOpenMelds(
  meldGroup: MeldGroup,
  openMeldTiles: readonly (readonly TileType[])[]
): MeldGroup {
  if (openMeldTiles.length === 0) return meldGroup

  // 鳴き面子のキーとカウント
  const openKeys = new Map<string, number>()
  for (const group of openMeldTiles) {
    const key = meldTileKey(group)
    openKeys.set(key, (openKeys.get(key) || 0) + 1)
  }

  // 一致する面子を isConcealed: false にする
  const newMelds = meldGroup.melds.map((meld) => {
    const key = meldTileKey(meld.tiles)
    const count = openKeys.get(key) || 0
    if (count > 0) {
      openKeys.set(key, count - 1)
      return { ...meld, isConcealed: false }
    }
    return meld
  })

  return {
    ...meldGroup,
    melds: newMelds as [Meld, Meld, Meld, Meld],
  }
}

// handGroupsからMeldGroupを構築（カンを含む手牌用）
function buildMeldGroupFromGroups(
  handGroups: readonly (readonly TileType[])[],
  winningTile: TileType,
  openMeldTiles: readonly (readonly TileType[])[]
): MeldGroup | null {
  const isSameTileLocal = (a: TileType, b: TileType): boolean => {
    if (a.type !== b.type) return false
    if (a.type === 'man' || a.type === 'pin' || a.type === 'sou')
      return a.number === b.number
    if (a.type === 'wind') return a.wind === b.wind
    if (a.type === 'dragon') return a.dragon === b.dragon
    return false
  }

  // openMeldTilesのキーマッチ用（消費可能なマップ）
  const openKeys = new Map<string, number>()
  for (const group of openMeldTiles) {
    const key = meldTileKey(group)
    openKeys.set(key, (openKeys.get(key) || 0) + 1)
  }

  const checkOpen = (
    keys: Map<string, number>,
    groupTiles: readonly TileType[]
  ) => {
    const key = meldTileKey(groupTiles)
    const count = keys.get(key) || 0
    if (count > 0) {
      keys.set(key, count - 1)
      return true
    }
    return false
  }

  // helper: can a pair be completed to a meld using winningTile (triplet or sequence)
  const canCompletePairWithWinning = (p: readonly TileType[], w: TileType) => {
    // triplet
    if (p.some((t) => isSameTileLocal(t, w)))
      return { ok: true, type: 'triplet' as const }

    // sequence possibility: both tiles and winning must be number tiles of same suit
    if (
      (w.type === 'man' || w.type === 'pin' || w.type === 'sou') &&
      p.every(
        (t) =>
          t.type === w.type &&
          (t.type === 'man' || t.type === 'pin' || t.type === 'sou')
      )
    ) {
      const nums = [p[0].number!, p[1].number!, w.number!].sort((a, b) => a - b)
      if (nums[0] + 1 === nums[1] && nums[1] + 1 === nums[2])
        return { ok: true, type: 'sequence' as const }
    }

    return { ok: false }
  }

  // categorize groups
  const kongs: TileType[][] = []
  const tripOrSeq: TileType[][] = []
  const pairs: TileType[][] = []

  for (const g of handGroups) {
    if (g.length === 4) kongs.push(Array.from(g) as TileType[])
    else if (g.length === 3) tripOrSeq.push(Array.from(g) as TileType[])
    else if (g.length === 2) pairs.push(Array.from(g) as TileType[])
    else return null
  }

  const baseMeldCount = kongs.length + tripOrSeq.length
  const neededMelds = 4 - baseMeldCount

  if (pairs.length !== neededMelds + 1) return null

  // choose a pair index such that other pairs can be completed with winning tile
  let chosenPairIndex = -1
  for (let i = 0; i < pairs.length; i++) {
    const others = pairs.filter((_, idx) => idx !== i)
    const allPromotable = others.every(
      (p) => canCompletePairWithWinning(p, winningTile).ok
    )
    if (allPromotable) {
      chosenPairIndex = i
      break
    }
  }

  if (chosenPairIndex === -1) return null

  // build final melds with open detection
  const trialOpenKeys = new Map(openKeys)
  const melds: Meld[] = []

  // add original kongs and trip/seq
  for (const g of handGroups) {
    if (g.length === 4) {
      const open = checkOpen(trialOpenKeys, g)
      melds.push({
        type: 'kong',
        tiles: g as readonly [TileType, TileType, TileType, TileType],
        isConcealed: !open,
      })
    } else if (g.length === 3) {
      const open = checkOpen(trialOpenKeys, g)
      const allSame = isSameTileLocal(g[0], g[1]) && isSameTileLocal(g[1], g[2])
      melds.push({
        type: allSame ? 'triplet' : 'sequence',
        tiles: g as readonly [TileType, TileType, TileType],
        isConcealed: !open,
      })
    }
  }

  // promote other pairs to melds using winningTile
  for (let i = 0; i < pairs.length; i++) {
    if (i === chosenPairIndex) continue
    const p = pairs[i]
    const result = canCompletePairWithWinning(p, winningTile)
    if (!result.ok) return null

    if (result.type === 'triplet') {
      // construct triplet tuple
      const trip: [TileType, TileType, TileType] = [
        p[0],
        p[1],
        winningTile,
      ] as [TileType, TileType, TileType]
      const open = checkOpen(trialOpenKeys, trip)
      melds.push({ type: 'triplet', tiles: trip, isConcealed: !open })
    } else {
      // sequence: construct sorted triple as tuple
      const seqTiles = [p[0], p[1], winningTile].slice() as TileType[]
      seqTiles.sort((a, b) => (a.number || 0) - (b.number || 0))
      const seq: [TileType, TileType, TileType] = [
        seqTiles[0],
        seqTiles[1],
        seqTiles[2],
      ] as [TileType, TileType, TileType]
      const open = checkOpen(trialOpenKeys, seq)
      melds.push({ type: 'sequence', tiles: seq, isConcealed: !open })
    }
  }

  const chosenPair = pairs[chosenPairIndex]
  const pair: Pair = {
    type: 'pair',
    tiles: [chosenPair[0], chosenPair[1]] as readonly [TileType, TileType],
    isConcealed: true,
  }

  if (melds.length !== 4) return null

  const wait = detectWaitType(melds, pair, winningTile)
  return {
    melds: melds as [Meld, Meld, Meld, Meld],
    pair,
    wait,
    winningTile,
    isSpecial: false,
  }
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
      <div className="flex flex-wrap items-end gap-3">
        {handSlots.map((slot, slotIndex) => {
          const hasTiles = slot.tiles.some((t) => t !== null)
          if (!hasTiles) return null

          return (
            <div key={slotIndex} className="flex items-end gap-0.5">
              {slot.tiles.map((tile, tileIndex) => {
                if (!tile) return null
                const isSideways = slot.sidewaysTiles?.has(tileIndex) || false
                const isWinningTileCheck =
                  slotIndex === handSlots.length - 1 && tileIndex === 0
                const isDora = isDoraIndicator(tile)
                if (isSideways) {
                  return (
                    <div
                      key={tileIndex}
                      className="relative inline-flex items-center justify-center"
                      style={{ width: 56, height: 40 }}
                    >
                      <div className="rotate-90 transform">
                        <Tile
                          tile={tile}
                          size="small"
                          isWinning={isWinningTileCheck}
                          isDora={isDora}
                        />
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={tileIndex}>
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
