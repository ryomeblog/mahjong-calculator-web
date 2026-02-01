/**
 * ホーム画面
 */

// 1. React関連
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. 型定義
import type { Tile } from '@/core/mahjong'

// 3. 内部コンポーネント
import { Header } from '@/components/common/Header'
import { SelectedTiles } from '@/components/tiles/SelectedTiles'
import { TileSelectModal } from '@/components/tiles/TileSelectModal'
import { MeldModal } from '@/components/tiles/MeldModal'
import { WindSelectorCompact } from '@/components/input/WindSelectorCompact'
import { WinConditionsCard } from '@/components/input/WinConditionsCard'
import { DoraHonbaCompact } from '@/components/input/DoraHonbaCompact'
import { SpecialYaku } from '@/components/input/SpecialYaku'
import { SpecialYakuModal } from '@/components/input/SpecialYakuModal'

// 4. カスタムフック
import { useTileInput } from '@/hooks/useTileInput'

type ModalTarget =
  | 'hand'
  | 'dora'
  | 'uraDora'
  | 'specialYaku'
  | 'pon'
  | 'chi'
  | 'kan'
  | null

export function Home() {
  const navigate = useNavigate()
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null)

  const {
    selectedTiles,
    handSlots,
    winningTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    roundWind,
    seatWind,
    removeTile,
    clearAll,
    toggleTsumo,
    toggleRiichi,
    toggleDoubleRiichi,
    setRoundWind,
    setSeatWind,
    // ドラ・本場
    doraTiles,
    uraDoraTiles,
    honba,
    removeDoraTile,
    incrementHonba,
    decrementHonba,
    // 特殊和了
    isIppatsu,
    isChankan,
    isRinshan,
    isHaitei,
    isHoutei,
    isTenhou,
    isChiihou,
    toggleIppatsu,
    toggleChankan,
    toggleRinshan,
    toggleHaitei,
    toggleHoutei,
    toggleTenhou,
    toggleChiihou,
    // バッチ設定
    setHandTiles,
    setDora,
    setUraDora,
  } = useTileInput()

  // モーダル設定
  const modalConfig = useMemo(() => {
    switch (modalTarget) {
      case 'hand':
        return {
          title: '手牌を選択',
          maxTiles: 14,
          initialTiles: selectedTiles,
        }
      case 'dora':
        return {
          title: 'ドラ表示牌を選択',
          maxTiles: 8,
          initialTiles: doraTiles,
        }
      case 'uraDora':
        return {
          title: '裏ドラ表示牌を選択',
          maxTiles: 4,
          initialTiles: uraDoraTiles,
        }
      default:
        return { title: '', maxTiles: 0, initialTiles: [] as Tile[] }
    }
  }, [modalTarget, selectedTiles, doraTiles, uraDoraTiles])

  const allGlobalTiles = useMemo(
    () => [...selectedTiles, ...doraTiles, ...uraDoraTiles],
    [selectedTiles, doraTiles, uraDoraTiles]
  )

  // モーダル確定処理（useCallbackで最適化）
  const handleModalConfirm = useCallback(
    (
      tiles: Tile[],
      slots?: import('@/components/tiles/HandStructureInput').MeldSlot[]
    ) => {
      switch (modalTarget) {
        case 'hand':
          setHandTiles(tiles, slots)
          break
        case 'dora':
          setDora(tiles)
          break
        case 'uraDora':
          setUraDora(tiles)
          break
      }
      setModalTarget(null)
    },
    [modalTarget, setHandTiles, setDora, setUraDora]
  )

  // 点数計算実行（useCallbackで最適化）
  const handleCalculate = useCallback(() => {
    if (selectedTiles.length === 14 && winningTile) {
      // 手牌13枚（上がり牌を除く）を計算
      const handTiles = selectedTiles.slice(0, 13)

      navigate('/result', {
        state: {
          tiles: handTiles,
          winningTile,
          isTsumo,
          isRiichi,
          isDoubleRiichi,
          roundWind,
          seatWind,
          isDealer: seatWind === 'east',
          doraTiles,
          uraDoraTiles,
          honba,
          isIppatsu,
          isChankan,
          isRinshan,
          isHaitei,
          isHoutei,
          isTenhou,
          isChiihou,
        },
      })
    }
  }, [
    selectedTiles,
    winningTile,
    isTsumo,
    isRiichi,
    isDoubleRiichi,
    roundWind,
    seatWind,
    doraTiles,
    uraDoraTiles,
    honba,
    isIppatsu,
    isChankan,
    isRinshan,
    isHaitei,
    isHoutei,
    isTenhou,
    isChiihou,
    navigate,
  ])

  const canCalculate = selectedTiles.length === 14 && winningTile !== null

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="container-responsive space-y-5 px-5 py-5 pb-32">
        {/* ① メイン入力レイヤー */}
        <SelectedTiles
          tiles={selectedTiles}
          handSlots={handSlots}
          winningTile={winningTile}
          onRemoveTile={removeTile}
          onOpenTileModal={() => setModalTarget('hand')}
        />

        {/* ② サブ情報レイヤー */}
        <WindSelectorCompact
          roundWind={roundWind}
          seatWind={seatWind}
          onRoundWindChange={setRoundWind}
          onSeatWindChange={setSeatWind}
        />

        {/* ドラ・本場情報 */}
        <DoraHonbaCompact
          doraTiles={doraTiles}
          honba={honba}
          onRemoveDoraTile={removeDoraTile}
          onOpenDoraModal={() => setModalTarget('dora')}
          onIncrementHonba={incrementHonba}
          onDecrementHonba={decrementHonba}
        />

        {/* 和了方法 */}
        <WinConditionsCard
          isTsumo={isTsumo}
          isRiichi={isRiichi}
          isDoubleRiichi={isDoubleRiichi}
          onToggleTsumo={toggleTsumo}
          onToggleRiichi={toggleRiichi}
          onToggleDoubleRiichi={toggleDoubleRiichi}
        />

        {/* 特殊和了 */}
        <SpecialYaku
          onOpenModal={() => setModalTarget('specialYaku')}
          hasSpecialYaku={
            isIppatsu ||
            isChankan ||
            isRinshan ||
            isHaitei ||
            isHoutei ||
            isTenhou ||
            isChiihou
          }
        />

        {/* ③ アクションボタン */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 rounded-xl bg-slate-700 py-3.5 text-sm text-slate-300 hover:bg-slate-600"
          >
            クリア
          </button>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`flex-1 rounded-xl py-3.5 text-sm font-semibold transition-colors ${
              canCalculate
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {canCalculate ? '点数を計算' : '手牌を入力してください'}
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-600">
          サンプル読込で操作を確認できます
        </p>
      </div>

      {/* 牌選択モーダル */}
      <TileSelectModal
        isOpen={modalTarget !== null && modalTarget !== 'specialYaku'}
        title={modalConfig.title}
        maxTiles={modalConfig.maxTiles}
        initialTiles={modalConfig.initialTiles}
        globalTiles={allGlobalTiles}
        onConfirm={handleModalConfirm}
        onClose={() => setModalTarget(null)}
      />

      {/* 特殊和了モーダル */}
      <SpecialYakuModal
        isOpen={modalTarget === 'specialYaku'}
        onClose={() => setModalTarget(null)}
        isIppatsu={isIppatsu}
        isChankan={isChankan}
        isRinshan={isRinshan}
        isHaitei={isHaitei}
        isHoutei={isHoutei}
        isTenhou={isTenhou}
        isChiihou={isChiihou}
        isRiichi={isRiichi}
        onToggleIppatsu={toggleIppatsu}
        onToggleChankan={toggleChankan}
        onToggleRinshan={toggleRinshan}
        onToggleHaitei={toggleHaitei}
        onToggleHoutei={toggleHoutei}
        onToggleTenhou={toggleTenhou}
        onToggleChiihou={toggleChiihou}
      />

      {/* 鳴きモーダル */}
      {(modalTarget === 'pon' ||
        modalTarget === 'chi' ||
        modalTarget === 'kan') && (
        <MeldModal
          isOpen={true}
          meldType={modalTarget}
          globalTiles={allGlobalTiles}
          onConfirm={(tiles) => {
            // 鳴き牌を手牌に追加
            const newTiles = [...selectedTiles, ...tiles]
            setHandTiles(newTiles)
            setModalTarget(null)
          }}
          onClose={() => setModalTarget(null)}
        />
      )}
    </div>
  )
}
