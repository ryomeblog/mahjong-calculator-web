/**
 * 手牌構造入力コンポーネント（雀頭・面子枠での入力）
 */

import type { Tile } from '@/core/mahjong'
import { TileSvg } from './TileSvg'
import { IoAdd, IoTrash } from 'react-icons/io5'

export type HandType = 'standard' | 'chiitoitsu' | 'kokushi'

export interface MeldSlot {
  tiles: (Tile | null)[]
  maxTiles: number
  label: string
  sidewaysTiles?: Set<number> // 横倒しにする牌のインデックスセット
}

interface HandStructureInputProps {
  readonly onSlotClick: (slotIndex: number) => void
  readonly onTileClick: (slotIndex: number, tileIndex: number) => void
  readonly onClearSlot: (slotIndex: number) => void
  readonly slots: MeldSlot[]
  readonly selectedSlotIndex: number | null
  readonly winningTileSlot?: { slotIndex: number; tileIndex: number } | null
}

export function HandStructureInput({
  onSlotClick,
  onTileClick,
  onClearSlot,
  slots,
  selectedSlotIndex,
  winningTileSlot,
}: HandStructureInputProps) {
  // 13枚入力済みかどうかを判定
  const totalTiles = slots.reduce(
    (count, slot) => count + slot.tiles.filter((t) => t !== null).length,
    0
  )
  const is13TilesFilled = totalTiles >= 13

  return (
    <div className="flex flex-wrap gap-3">
      {slots.map((slot, slotIndex) => {
        const isSelected = selectedSlotIndex === slotIndex
        const isWinningTileSlot = slotIndex === slots.length - 1
        const isDisabled = is13TilesFilled && !isWinningTileSlot

        return (
          <div
            key={slotIndex}
            onClick={() => !isDisabled && onSlotClick(slotIndex)}
            className={`min-w-[140px] flex-1 rounded-lg border-2 p-3 transition-all ${
              isDisabled
                ? 'cursor-not-allowed border-slate-800 bg-slate-950 opacity-50'
                : isSelected
                  ? 'cursor-pointer border-blue-500 bg-blue-900/30 shadow-md'
                  : 'cursor-pointer border-slate-700 bg-slate-900 hover:border-slate-600'
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {slot.label}
                {slot.sidewaysTiles && slot.sidewaysTiles.size > 0 && (
                  <span className="ml-1 text-orange-400">（鳴き）</span>
                )}
              </span>
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onClearSlot(slotIndex)
                }}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-slate-700"
                title="クリア"
              >
                <IoTrash
                  size={14}
                  className="text-slate-400 hover:text-red-400"
                />
              </div>
            </div>
            <div className="flex gap-1">
              {slot.tiles.map((tile, tileIndex) => {
                const isWinningTile =
                  winningTileSlot?.slotIndex === slotIndex &&
                  winningTileSlot?.tileIndex === tileIndex
                const isSideways = slot.sidewaysTiles?.has(tileIndex) || false
                return (
                  <button
                    key={tileIndex}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (tile) {
                        onTileClick(slotIndex, tileIndex)
                      }
                    }}
                    className={`flex h-16 w-12 items-center justify-center rounded border-2 transition-all ${
                      tile
                        ? isWinningTile
                          ? 'border-yellow-500 bg-yellow-900/30'
                          : isSideways
                            ? 'border-orange-500 bg-orange-900/20'
                            : 'border-slate-600 bg-slate-800 hover:border-blue-400'
                        : 'border-dashed border-slate-600 bg-slate-800'
                    }`}
                  >
                    {tile ? (
                      <div
                        className={
                          isSideways && !isWinningTile
                            ? 'rotate-90 transform'
                            : ''
                        }
                      >
                        <TileSvg tile={tile} size="small" />
                      </div>
                    ) : (
                      <IoAdd size={20} className="text-slate-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// スロット構造を生成するヘルパー関数
export function createSlots(handType: HandType): MeldSlot[] {
  switch (handType) {
    case 'standard':
      return [
        {
          tiles: [null, null],
          maxTiles: 2,
          label: '雀頭',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子1',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子2',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子3',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null, null, null],
          maxTiles: 3,
          label: '面子4',
          sidewaysTiles: new Set(),
        },
        {
          tiles: [null],
          maxTiles: 1,
          label: '上がり牌',
          sidewaysTiles: new Set(),
        },
      ]
    case 'chiitoitsu':
      return Array.from({ length: 7 }, (_, i) => ({
        tiles: [null, null],
        maxTiles: 2,
        label: `対子${i + 1}`,
      }))
    case 'kokushi':
      return [
        {
          tiles: Array(13).fill(null),
          maxTiles: 13,
          label: '么九牌13種',
        },
        { tiles: [null], maxTiles: 1, label: '雀頭' },
      ]
  }
}
