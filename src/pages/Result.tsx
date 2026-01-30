/**
 * 結果画面
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { Tile } from '@/components/tiles/Tile'
import { MeldDisplay } from '@/components/result/MeldDisplay'
import { YakuList } from '@/components/result/YakuList'
import { FuCalculation } from '@/components/result/FuCalculation'
import { ScoreDisplay } from '@/components/result/ScoreDisplay'
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
} from '@/core/mahjong'

interface LocationState {
  tiles: readonly TileType[]
  winningTile: TileType
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  roundWind: Wind
  seatWind: Wind
  isDealer: boolean
}

export function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  if (!state || !state.tiles || !state.winningTile) {
    navigate('/')
    return null
  }

  const {
    tiles,
    winningTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    roundWind,
    seatWind,
    isDealer,
  } = state

  // 面子分解
  const meldGroups = decomposeStandard(tiles, winningTile)
  const specialForms = detectSpecialForms(tiles, winningTile)
  const allForms = [...meldGroups, ...specialForms]

  if (allForms.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f4f0]">
        <Header />
        <div className="max-w-4xl mx-auto p-5">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#c0392b] mb-4">
              面子分解に失敗しました
            </h2>
            <p className="text-gray-700 mb-6">
              正しい手牌を入力してください。
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-[#27ae60] text-white px-8 py-3 rounded-lg hover:opacity-80"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 和了条件
  const conditions: WinningConditions = {
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    isIppatsu: false,
    isChankan: false,
    isRinshan: false,
    isHaitei: false,
    isHoutei: false,
    isTenhou: false,
    isChiihou: false,
    prevailingWind: roundWind,
    seatWind,
    isDealer,
    doraCount: 0,
    uraDoraCount: 0,
    redDoraCount: 0,
  }

  // 最初の面子分解を使用（複数ある場合は最も点数が高いものを選ぶべきだが、簡略化のため最初のものを使用）
  const firstForm = allForms[0]

  // SpecialFormの場合は標準の面子分解として扱えないので、MeldGroupのみを対象とする
  const meldGroup = 'melds' in firstForm ? firstForm : meldGroups[0]

  if (!meldGroup) {
    return (
      <div className="min-h-screen bg-[#f0f4f0]">
        <Header />
        <div className="max-w-4xl mx-auto p-5">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#c0392b] mb-4">
              面子分解に失敗しました
            </h2>
            <p className="text-gray-700 mb-6">
              正しい手牌を入力してください。
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-[#27ae60] text-white px-8 py-3 rounded-lg hover:opacity-80"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 役判定
  const yakuList = detectYaku(meldGroup, conditions)

  if (yakuList.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f4f0]">
        <Header />
        <div className="max-w-4xl mx-auto p-5">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-[#c0392b] mb-4">
              役がありません
            </h2>
            <p className="text-gray-700 mb-6">
              和了形ですが、役がないため上がれません。
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-[#27ae60] text-white px-8 py-3 rounded-lg hover:opacity-80"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 翻数計算
  const han = calculateHan(yakuList, conditions)

  // 符計算
  const fuCalculation = calculateFu(meldGroup, conditions)

  // 点数計算
  const scoreCalculation = calculateScore(fuCalculation, han, conditions)

  return (
    <div className="min-h-screen bg-[#f0f4f0]">
      <Header />

      <div className="max-w-4xl mx-auto p-5 space-y-5">
        {/* 手牌表示エリア */}
        <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
          <h3 className="text-lg font-bold text-[#2d5016] mb-4">手牌入力</h3>
          <div className="flex flex-wrap gap-1">
            {tiles.slice(0, -1).map((tile, index) => (
              <Tile key={index} tile={tile} size="small" />
            ))}
            <div className="mx-2" />
            <Tile tile={winningTile} isWinning size="small" />
          </div>
          <p className="mt-2 text-sm text-[#f39c12]">
            {isTsumo ? 'ツモ' : 'ロン'}
          </p>
        </div>

        {/* 面子分解 */}
        <MeldDisplay meldGroup={meldGroup} />

        {/* 役判定 */}
        <YakuList yakuList={yakuList} totalHan={han} />

        {/* 符計算と点数計算 */}
        <div className="grid grid-cols-2 gap-5">
          <FuCalculation fuCalculation={fuCalculation} />
          <ScoreDisplay
            scoreCalculation={scoreCalculation}
            isDealer={isDealer}
          />
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-[#95a5a6] text-white text-lg py-3 rounded-lg hover:opacity-80"
          >
            もう一度
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-[#27ae60] text-white text-lg py-3 rounded-lg hover:opacity-80"
          >
            新しい手牌
          </button>
        </div>
      </div>
    </div>
  )
}
