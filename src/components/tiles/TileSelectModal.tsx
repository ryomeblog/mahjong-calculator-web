/**
 * 牌選択モーダルコンポーネント
 * 手牌・ドラ・裏ドラの選択に共通で使用
 */

// 1. React関連
import { useState, useEffect, useCallback, useMemo } from 'react'
import { IoClose } from 'react-icons/io5'

// 2. 型定義
import type { Tile } from '@/core/mahjong'

// 3. 内部コンポーネント
import { TileSvg } from './TileSvg'
import { TileGrid } from './TileGrid'
import {
  HandStructureInput,
  type HandType,
  type MeldSlot,
} from './HandStructureInput'
import { HandTypeModal, HandTypeSettingButton } from './HandTypeModal'
import { createSlots } from '@/utils/handStructureUtils'
import { isSameTile } from '@/utils/tileUtils'

interface TileSelectModalProps {
  /** モーダル表示状態 */
  readonly isOpen: boolean
  /** モーダルタイトル */
  readonly title: string
  /** 選択可能な最大枚数 */
  readonly maxTiles: number
  /** モーダルを開いた時点で既に選択済みの牌 */
  readonly initialTiles: readonly Tile[]
  /** 全エリアで使用中の牌（グローバル4枚制限用） */
  readonly globalTiles: readonly Tile[]
  /** 決定時のコールバック */
  readonly onConfirm: (tiles: Tile[], slots?: MeldSlot[]) => void
  /** 閉じる時のコールバック */
  readonly onClose: () => void
}

export function TileSelectModal({
  isOpen,
  title,
  maxTiles,
  initialTiles,
  globalTiles,
  onConfirm,
  onClose,
}: TileSelectModalProps) {
  // 手牌選択モードかどうか
  const isHandMode = maxTiles === 14
  // ドラ/裏ドラモード
  const isDoraMode = maxTiles === 4 || maxTiles === 8

  // ドラモード用の状態
  const [stagingTiles, setStagingTiles] = useState<Tile[]>([])

  // 手牌モード用の状態
  const [handType, setHandType] = useState<HandType>('standard')
  const [isHandTypeModalOpen, setIsHandTypeModalOpen] = useState(false)
  const [slots, setSlots] = useState<MeldSlot[]>(() => createSlots('standard'))
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null
  )
  const [winningTileSlot, setWinningTileSlot] = useState<{
    slotIndex: number
    tileIndex: number
  } | null>(null)

  // モーダルが開いたら初期値をセット
  useEffect(() => {
    if (isOpen) {
      if (isHandMode) {
        // 手牌モード: スロットに変換
        const newSlots = createSlots(handType)

        // 14枚の場合、最後の1枚は上がり牌スロットに
        if (initialTiles.length === 14) {
          let tileIdx = 0
          // 最後のスロット以外に牌を配置
          for (let slotIdx = 0; slotIdx < newSlots.length - 1; slotIdx++) {
            for (
              let i = 0;
              i < newSlots[slotIdx].maxTiles && tileIdx < 13;
              i++
            ) {
              newSlots[slotIdx].tiles[i] = initialTiles[tileIdx++]
            }
          }
          // 最後の1枚を上がり牌スロットに
          newSlots[newSlots.length - 1].tiles[0] = initialTiles[13]
          setSelectedSlotIndex(newSlots.length - 1) // 上がり牌スロットを選択
        } else {
          // 14枚未満の場合は従来通り
          let tileIdx = 0
          for (let slotIdx = 0; slotIdx < newSlots.length; slotIdx++) {
            for (
              let i = 0;
              i < newSlots[slotIdx].maxTiles && tileIdx < initialTiles.length;
              i++
            ) {
              newSlots[slotIdx].tiles[i] = initialTiles[tileIdx++]
            }
          }
          setSelectedSlotIndex(0) // 最初のスロットを選択
        }

        setSlots(newSlots)
      } else if (isDoraMode) {
        // ドラ/裏ドラモード: スロット形式
        const slotCount = maxTiles / 4
        const newSlots: MeldSlot[] = Array.from(
          { length: slotCount },
          (_, i) => ({
            tiles: Array(4).fill(null),
            maxTiles: 4,
            label: i === 0 ? 'ドラ' : '裏ドラ',
            sidewaysTiles: new Set<number>(),
          })
        )

        // 初期牌をスロットに配置
        let tileIdx = 0
        for (let slotIdx = 0; slotIdx < newSlots.length; slotIdx++) {
          for (let i = 0; i < 4 && tileIdx < initialTiles.length; i++) {
            newSlots[slotIdx].tiles[i] = initialTiles[tileIdx++]
          }
        }

        setSlots(newSlots)
        setSelectedSlotIndex(0)
      } else {
        // その他: 従来通り
        setStagingTiles([...initialTiles])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, handType, maxTiles])

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // スロットクリック（手牌モード）
  const handleSlotClick = useCallback((slotIndex: number) => {
    setSelectedSlotIndex(slotIndex)
  }, [])

  // 牌クリック（鳴き判定の切り替え）
  const handleTileClick = useCallback(
    (slotIndex: number, tileIndex: number) => {
      // 上がり牌スロット（最後のスロット）の場合は何もしない
      if (slotIndex === slots.length - 1) return

      // 個別の牌を横倒しに切り替え
      setSlots((prev) => {
        const newSlots = prev.map((slot, idx) => {
          if (idx !== slotIndex) {
            return { ...slot, tiles: [...slot.tiles] }
          }

          const newSidewaysTiles: Set<number> = new Set(
            slot.sidewaysTiles || new Set<number>()
          )
          if (newSidewaysTiles.has(tileIndex)) {
            newSidewaysTiles.delete(tileIndex)
          } else {
            newSidewaysTiles.add(tileIndex)
          }

          return {
            ...slot,
            tiles: [...slot.tiles],
            sidewaysTiles: newSidewaysTiles,
          }
        })
        return newSlots
      })
    },
    [slots]
  )

  // スロットクリア
  const handleClearSlot = useCallback((slotIndex: number) => {
    setSlots((prev) => {
      const newSlots = prev.map((slot, idx) =>
        idx === slotIndex
          ? {
              ...slot,
              tiles: slot.tiles.map(() => null),
              sidewaysTiles: new Set<number>(),
            }
          : { ...slot, tiles: [...slot.tiles] }
      )

      // クリア後の合計枚数を計算
      const totalTiles = newSlots.reduce(
        (count, s) => count + s.tiles.filter((t) => t !== null).length,
        0
      )

      // 13枚未満になったら最初の空きスロットを選択
      if (totalTiles < 13) {
        const firstEmptySlot = newSlots.findIndex(
          (s) =>
            s.tiles.some((t) => t === null) &&
            newSlots.indexOf(s) < newSlots.length - 1
        )
        if (firstEmptySlot !== -1) {
          setSelectedSlotIndex(firstEmptySlot)
        }
      }

      return newSlots
    })
    setWinningTileSlot((prev) => (prev?.slotIndex === slotIndex ? null : prev))
  }, [])

  // 牌選択（手牌モード）
  const handleTileSelectForSlot = useCallback(
    (tile: Tile) => {
      if (selectedSlotIndex === null) return

      setSlots((prev) => {
        const newSlots = prev.map((slot) => ({
          ...slot,
          tiles: [...slot.tiles],
        }))

        // 空いている最初の位置に牌を追加
        const slot = newSlots[selectedSlotIndex]
        const emptyIndex = slot.tiles.findIndex((t) => t === null)
        if (emptyIndex !== -1) {
          slot.tiles[emptyIndex] = tile

          // 合計枚数を計算
          const totalTiles = newSlots.reduce(
            (count, s) => count + s.tiles.filter((t) => t !== null).length,
            0
          )

          // 13枚以上になったら上がり牌スロットを選択
          if (totalTiles >= 13) {
            setSelectedSlotIndex(newSlots.length - 1)
          } else {
            // スロットが満杯になったら次のスロットに移動
            const isFull = slot.tiles.every((t) => t !== null)
            if (isFull && selectedSlotIndex < newSlots.length - 1) {
              setSelectedSlotIndex(selectedSlotIndex + 1)
            }
          }
        }

        return newSlots
      })
    },
    [selectedSlotIndex]
  )

  // 牌選択（ドラモード）
  const handleTileSelect = useCallback(
    (tile: Tile) => {
      if (isHandMode || isDoraMode) {
        handleTileSelectForSlot(tile)
      } else {
        setStagingTiles((prev) => {
          if (prev.length >= maxTiles) return prev
          return [...prev, tile]
        })
      }
    },
    [isHandMode, isDoraMode, handleTileSelectForSlot, maxTiles]
  )

  // 牌削除（ドラモード）
  const handleRemoveStaging = useCallback((index: number) => {
    setStagingTiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // 手牌形式変更
  const handleHandTypeChange = useCallback((newType: HandType) => {
    setHandType(newType)
    setSelectedSlotIndex(0)
  }, [])

  // 決定ボタン
  const handleConfirm = () => {
    if (isHandMode || isDoraMode) {
      // スロットから牌配列に変換
      const tiles: Tile[] = []
      for (const slot of slots) {
        for (const tile of slot.tiles) {
          if (tile) tiles.push(tile)
        }
      }
      onConfirm(tiles, isHandMode ? slots : undefined) // 手牌モードの場合のみスロット情報も渡す
    } else {
      onConfirm(stagingTiles)
    }
    onClose()
  }

  // 現在の牌数を計算
  const currentTileCount =
    isHandMode || isDoraMode
      ? slots.reduce(
          (count, slot) => count + slot.tiles.filter((t) => t !== null).length,
          0
        )
      : stagingTiles.length

  // initialTilesを除外したグローバル牌を計算（編集時の二重カウント防止）
  const effectiveGlobalTiles = useMemo(() => {
    const remaining = [...globalTiles]
    for (const tile of initialTiles) {
      const idx = remaining.findIndex((t) => isSameTile(t, tile))
      if (idx !== -1) {
        remaining.splice(idx, 1)
      }
    }
    return remaining
  }, [globalTiles, initialTiles])

  // スロットから使用中の牌を取得
  const slotsUsedTiles = useMemo(() => {
    if (!isHandMode && !isDoraMode) return []
    const tiles: Tile[] = []
    for (const slot of slots) {
      for (const tile of slot.tiles) {
        if (tile) tiles.push(tile)
      }
    }
    return tiles
  }, [isHandMode, isDoraMode, slots])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center">
        {/* オーバーレイ */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* モーダル本体 */}
        <div className="relative mx-0 flex h-full w-full flex-col bg-slate-800 sm:mx-4 sm:h-auto sm:max-h-[90vh] sm:max-w-none sm:rounded-2xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b border-slate-700 p-4">
            <h3 className="text-base font-bold text-slate-50 sm:text-lg">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              {isHandMode && (
                <HandTypeSettingButton
                  onClick={() => setIsHandTypeModalOpen(true)}
                />
              )}
              <div
                onClick={onClose}
                className="cursor-pointer text-slate-400 hover:text-slate-200"
              >
                <IoClose size={28} />
              </div>
            </div>
          </div>

          {/* 選択中の牌 / 手牌構造 */}
          <div className="overflow-y-auto border-b border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-300">
                {isHandMode
                  ? '手牌構造'
                  : isDoraMode
                    ? 'ドラ/裏ドラ'
                    : '選択中の牌'}
                （{currentTileCount} / {maxTiles}枚）
              </p>
            </div>

            {isHandMode || isDoraMode ? (
              <HandStructureInput
                onSlotClick={handleSlotClick}
                onTileClick={handleTileClick}
                onClearSlot={handleClearSlot}
                slots={slots}
                selectedSlotIndex={selectedSlotIndex}
                winningTileSlot={winningTileSlot}
              />
            ) : (
              <div className="flex min-h-[60px] flex-wrap items-center gap-2">
                {stagingTiles.length === 0 ? (
                  <span className="text-sm text-slate-500">
                    下の牌をタップして追加してください
                  </span>
                ) : (
                  <>
                    {Array.from(
                      { length: Math.ceil(stagingTiles.length / 3) },
                      (_, groupIndex) => {
                        const start = groupIndex * 3
                        const end = Math.min(start + 3, stagingTiles.length)
                        const groupTiles = stagingTiles.slice(start, end)
                        return (
                          <div
                            key={groupIndex}
                            className="flex items-center gap-0.5"
                          >
                            {groupTiles.map((tile, tileIndex) => {
                              const actualIndex = start + tileIndex
                              return (
                                <button
                                  key={actualIndex}
                                  type="button"
                                  onClick={() =>
                                    handleRemoveStaging(actualIndex)
                                  }
                                  className="cursor-pointer hover:opacity-60"
                                  title="クリックで削除"
                                >
                                  <TileSvg tile={tile} size="small" />
                                </button>
                              )
                            })}
                          </div>
                        )
                      }
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* 牌グリッド */}
          <div className="h-[385px] min-h-[385px] overflow-y-auto border-t border-slate-700 p-4">
            {(isHandMode || isDoraMode) && selectedSlotIndex !== null && (
              <p className="mb-3 text-sm text-slate-400">
                {slots[selectedSlotIndex].label}に追加する牌を選択
              </p>
            )}
            {(!(isHandMode || isDoraMode) || selectedSlotIndex !== null) && (
              <TileGrid
                globalTiles={effectiveGlobalTiles}
                stagingTiles={
                  isHandMode || isDoraMode ? slotsUsedTiles : stagingTiles
                }
                onTileSelect={handleTileSelect}
                maxTiles={maxTiles}
              />
            )}
          </div>

          {/* フッター */}
          <div className="flex gap-3 border-t border-slate-700 p-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-slate-700 py-3 text-sm text-slate-300 hover:bg-slate-600"
            >
              閉じる
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              決定
            </button>
          </div>
        </div>
      </div>

      {/* 手牌形式選択モーダル */}
      {isHandMode && (
        <HandTypeModal
          isOpen={isHandTypeModalOpen}
          currentType={handType}
          onSelect={handleHandTypeChange}
          onClose={() => setIsHandTypeModalOpen(false)}
        />
      )}
    </>
  )
}
