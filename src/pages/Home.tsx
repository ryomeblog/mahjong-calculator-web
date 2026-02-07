/**
 * ホーム画面
 */

// 1. React関連
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// 2. 型定義
import type { Tile } from '@/core/mahjong'

// 3. ユーティリティ
import { locationStateToSearchParams } from '@/utils/urlSerializer'
import { createSlots } from '@/utils/handStructureUtils'

// 4. 内部コンポーネント
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
  const location = useLocation()
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
    clearHandTiles,
    toggleTsumo,
    toggleRiichi,
    toggleDoubleRiichi,
    setRoundWind,
    setSeatWind,
    // ドラ・本場
    doraTiles,
    uraDoraTiles,
    honba,
    setHonbaDirect,
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

  // 結果画面から戻ってきた場合、入力内容を復元
  useEffect(() => {
    const restoredState = location.state as LocationState | null
    if (restoredState && restoredState.tiles) {
      // 手牌とスロット情報を復元（handSlotsがない場合はhandGroupsから生成）
      let restoredSlots = restoredState.handSlots || undefined
      if (
        !restoredSlots &&
        restoredState.handGroups &&
        restoredState.winningTile &&
        restoredState.tiles.length >= 14
      ) {
        const groups = restoredState.handGroups
        const handType =
          groups.length === 7
            ? 'chiitoitsu'
            : groups.length === 1 && groups[0].length === 13
              ? 'kokushi'
              : 'standard'
        const slots = createSlots(handType)
        for (let i = 0; i < Math.min(groups.length, slots.length - 1); i++) {
          // カングループ（4枚）の場合はスロットを拡張
          if (groups[i].length === 4 && slots[i].maxTiles === 3) {
            slots[i].maxTiles = 4
            slots[i].tiles = [null, null, null, null]
          }
          for (let j = 0; j < groups[i].length && j < slots[i].maxTiles; j++) {
            slots[i].tiles[j] = groups[i][j]
          }
        }
        slots[slots.length - 1].tiles[0] = restoredState.winningTile
        restoredSlots = slots
      }
      setHandTiles([...restoredState.tiles], restoredSlots)

      // ドラ情報を復元
      if (restoredState.doraTiles) setDora([...restoredState.doraTiles])
      if (restoredState.uraDoraTiles)
        setUraDora([...restoredState.uraDoraTiles])

      // 本場数を復元（直接代入）
      const targetHonba = restoredState.honba || 0
      setHonbaDirect(targetHonba)

      // 風を復元
      setRoundWind(restoredState.roundWind)
      setSeatWind(restoredState.seatWind)

      // 和了条件を復元
      if (restoredState.isTsumo !== isTsumo) toggleTsumo()
      if (restoredState.isRiichi !== isRiichi) toggleRiichi()
      if (restoredState.isDoubleRiichi !== isDoubleRiichi) toggleDoubleRiichi()

      // 特殊和了を復元
      if (restoredState.isIppatsu && !isIppatsu) toggleIppatsu()
      if (restoredState.isChankan && !isChankan) toggleChankan()
      if (restoredState.isRinshan && !isRinshan) toggleRinshan()
      if (restoredState.isHaitei && !isHaitei) toggleHaitei()
      if (restoredState.isHoutei && !isHoutei) toggleHoutei()
      if (restoredState.isTenhou && !isTenhou) toggleTenhou()
      if (restoredState.isChiihou && !isChiihou) toggleChiihou()

      // stateをクリアして再度実行されないようにする
      navigate('/', { replace: true, state: null })
    }
  }, [location.state])

  interface LocationState {
    tiles: readonly Tile[]
    winningTile: Tile
    handSlots?:
      | import('@/components/tiles/HandStructureInput').MeldSlot[]
      | null
    handGroups?: readonly (readonly Tile[])[]
    isTsumo: boolean
    isRiichi: boolean
    isDoubleRiichi: boolean
    roundWind: import('@/core/mahjong').Wind
    seatWind: import('@/core/mahjong').Wind
    isDealer: boolean
    doraTiles?: readonly Tile[]
    uraDoraTiles?: readonly Tile[]
    honba?: number
    isIppatsu?: boolean
    isChankan?: boolean
    isRinshan?: boolean
    isHaitei?: boolean
    isHoutei?: boolean
    isTenhou?: boolean
    isChiihou?: boolean
  }

  // モーダル設定
  // 手牌モーダルの isHandMode は maxTiles===14 で判定されるため、常に14を渡す
  const modalConfig = useMemo(() => {
    switch (modalTarget) {
      case 'hand':
        return {
          title: '手牌を選択',
          maxTiles: 14 as number,
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
    if (selectedTiles.length >= 14 && winningTile) {
      // handSlotsからグループ構造を取得（和了牌スロットを除く）
      let handGroups: Tile[][] | undefined
      let openGroups: number[] | undefined
      if (handSlots && handSlots.length > 1) {
        const meldSlots = handSlots.slice(0, -1)
        handGroups = meldSlots
          .map((slot) => slot.tiles.filter((t): t is Tile => t !== null))
          .filter((group) => group.length > 0)
        // 鳴いているスロット（sidewaysTilesがある）のインデックスを記録
        const openIndices: number[] = []
        // handGroupsのインデックスに合わせるため、空でないスロットのみカウント
        let groupIdx = 0
        for (const slot of meldSlots) {
          const hasTiles = slot.tiles.some((t) => t !== null)
          if (!hasTiles) continue
          if (slot.sidewaysTiles && slot.sidewaysTiles.size > 0) {
            openIndices.push(groupIdx)
          }
          groupIdx++
        }
        if (openIndices.length > 0) {
          openGroups = openIndices
        }
      }

      const stateData = {
        tiles: selectedTiles,
        winningTile,
        handSlots,
        handGroups,
        openGroups,
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
      }
      const queryString = locationStateToSearchParams(stateData).toString()
      navigate(`/result?${queryString}`, { state: stateData })
    }
  }, [
    selectedTiles,
    winningTile,
    handSlots,
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

  const canCalculate = selectedTiles.length >= 14 && winningTile !== null

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
          onClearHandTiles={clearHandTiles}
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
      </div>

      {/* 牌選択モーダル */}
      <TileSelectModal
        isOpen={
          modalTarget !== null &&
          modalTarget !== 'specialYaku' &&
          modalTarget !== 'pon' &&
          modalTarget !== 'chi' &&
          modalTarget !== 'kan'
        }
        title={modalConfig.title}
        maxTiles={modalConfig.maxTiles}
        initialTiles={modalConfig.initialTiles}
        initialSlots={modalTarget === 'hand' ? handSlots : undefined}
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
