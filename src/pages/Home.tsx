/**
 * ホーム画面
 */

import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { SelectedTiles } from '@/components/tiles/SelectedTiles'
import { TileSelector } from '@/components/tiles/TileSelector'
import { WindSelector } from '@/components/input/WindSelector'
import { WinConditions } from '@/components/input/WinConditions'
import { useTileInput } from '@/hooks/useTileInput'

export function Home() {
  const navigate = useNavigate()
  const {
    selectedTiles,
    winningTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    roundWind,
    seatWind,
    addTile,
    removeTile,
    clearAll,
    toggleTsumo,
    toggleRiichi,
    toggleDoubleRiichi,
    setRoundWind,
    setSeatWind,
  } = useTileInput()

  const handleCalculate = () => {
    if (selectedTiles.length === 14 && winningTile) {
      // 計算結果を結果画面に渡す
      navigate('/result', {
        state: {
          tiles: selectedTiles,
          winningTile,
          isTsumo,
          isRiichi,
          isDoubleRiichi,
          roundWind,
          seatWind,
          isDealer: seatWind === 'east',
        },
      })
    }
  }

  const canCalculate = selectedTiles.length === 14 && winningTile !== null

  return (
    <div className="min-h-screen bg-[#f0f4f0]">
      <Header />

      {/* サブタイトル */}
      <div className="bg-[#3a6b1f] h-12 flex items-center justify-center">
        <p className="text-white text-lg">手牌と和了情報を入力してください</p>
      </div>

      <div className="max-w-4xl mx-auto p-5 space-y-5">
        {/* 現在の手牌表示エリア */}
        <SelectedTiles
          tiles={selectedTiles}
          winningTile={winningTile}
          onRemoveTile={removeTile}
        />

        {/* 場情報 */}
        <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
          <div className="flex gap-8">
            <WindSelector
              label="場風"
              selectedWind={roundWind}
              onChange={setRoundWind}
            />
            <WindSelector
              label="自風"
              selectedWind={seatWind}
              onChange={setSeatWind}
            />
          </div>
        </div>

        {/* 和了情報 */}
        <WinConditions
          isTsumo={isTsumo}
          isRiichi={isRiichi}
          isDoubleRiichi={isDoubleRiichi}
          onToggleTsumo={toggleTsumo}
          onToggleRiichi={toggleRiichi}
          onToggleDoubleRiichi={toggleDoubleRiichi}
        />

        {/* 牌選択パネル */}
        <TileSelector selectedTiles={selectedTiles} onAddTile={addTile} />

        {/* アクションボタン */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 bg-[#95a5a6] text-white text-lg py-4 rounded-lg hover:opacity-80"
          >
            クリア
          </button>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`
              flex-1 text-white text-lg font-bold py-4 rounded-lg
              ${
                canCalculate
                  ? 'bg-[#27ae60] hover:opacity-80 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            計算開始
          </button>
        </div>
      </div>
    </div>
  )
}
