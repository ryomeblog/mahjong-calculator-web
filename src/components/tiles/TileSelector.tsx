/**
 * 牌選択パネルコンポーネント
 */

import { useState } from 'react'
import type { Tile, TileType as CoreTileType, TileNumber, Wind, Dragon } from '@/core/mahjong'
import type { TileTab } from '@/types/ui'
import { TILE_TAB_LABELS } from '@/types/ui'
import { TileSvg } from './TileSvg'

interface TileSelectorProps {
  selectedTiles: readonly Tile[]
  onAddTile: (tile: Tile) => void
  maxTiles?: number
}

export function TileSelector({ selectedTiles, onAddTile, maxTiles = 14 }: TileSelectorProps) {
  const [activeTab, setActiveTab] = useState<TileTab>('man')

  const getTileCount = (tile: Tile): number => {
    return selectedTiles.filter((t) => isSameTile(t, tile)).length
  }

  const isSameTile = (a: Tile, b: Tile): boolean => {
    if (a.type !== b.type) return false
    if (a.type === 'man' || a.type === 'pin' || a.type === 'sou') {
      return a.number === b.number && a.isRed === b.isRed
    }
    if (a.type === 'wind') return a.wind === b.wind
    if (a.type === 'dragon') return a.dragon === b.dragon
    return false
  }

  const canAddTile = (tile: Tile): boolean => {
    if (selectedTiles.length >= maxTiles) return false
    return getTileCount(tile) < 4
  }

  const handleTileClick = (tile: Tile) => {
    if (canAddTile(tile)) {
      onAddTile(tile)
    }
  }

  const renderNumberTile = (
    type: CoreTileType,
    number: TileNumber,
    isRed: boolean = false
  ) => {
    const tile: Tile = { type, number, isRed }
    const count = getTileCount(tile)
    const disabled = !canAddTile(tile)

    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => handleTileClick(tile)}
          disabled={disabled}
          className={`
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
          `}
        >
          <TileSvg tile={tile} size="medium" />
        </button>
        <div className="w-6 h-6 rounded-full bg-[#e8f8f5] border-2 border-[#16a085] flex items-center justify-center">
          <span className="text-xs text-[#16a085]">{count}</span>
        </div>
        {isRed && (
          <span className="text-xs text-[#e67e22]">赤ドラ</span>
        )}
      </div>
    )
  }

  const renderHonorTile = (tileType: 'wind' | 'dragon', value: Wind | Dragon, label: string) => {
    const tile: Tile = tileType === 'wind' ? { type: 'wind', wind: value as Wind } : { type: 'dragon', dragon: value as Dragon }
    const count = getTileCount(tile)
    const disabled = !canAddTile(tile)

    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => handleTileClick(tile)}
          disabled={disabled}
          className={`
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
          `}
        >
          <TileSvg tile={tile} size="medium" />
        </button>
        <div className="w-6 h-6 rounded-full bg-[#e8f8f5] border-2 border-[#16a085] flex items-center justify-center">
          <span className="text-xs text-[#16a085]">{count}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
      <h3 className="text-[#2d5016] font-bold mb-3">牌を選択</h3>

      {/* タブ - ボタンではなくタブ形式に */}
      <div className="flex border-b-2 border-gray-300 mb-4">
        {(['man', 'pin', 'sou', 'honor'] as TileTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-4 py-3 font-medium transition-all relative
              ${
                activeTab === tab
                  ? 'text-[#c0392b] border-b-4 border-[#c0392b] -mb-[2px] bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }
            `}
          >
            {TILE_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* 牌パネル - 背景を白に */}
      <div className="bg-white rounded p-4 min-h-[430px] border border-gray-200">
        {activeTab === 'man' && (
          <div className="grid grid-cols-7 gap-4">
            {([1, 2, 3, 4, 5, 6, 7] as TileNumber[]).map((num) => (
              <div key={num}>{renderNumberTile('man', num)}</div>
            ))}
            <div className="col-start-2">{renderNumberTile('man', 8)}</div>
            <div>{renderNumberTile('man', 9)}</div>
            <div className="col-start-5">{renderNumberTile('man', 5, true)}</div>
          </div>
        )}

        {activeTab === 'pin' && (
          <div className="grid grid-cols-7 gap-4">
            {([1, 2, 3, 4, 5, 6, 7] as TileNumber[]).map((num) => (
              <div key={num}>{renderNumberTile('pin', num)}</div>
            ))}
            <div className="col-start-2">{renderNumberTile('pin', 8)}</div>
            <div>{renderNumberTile('pin', 9)}</div>
            <div className="col-start-5">{renderNumberTile('pin', 5, true)}</div>
          </div>
        )}

        {activeTab === 'sou' && (
          <div className="grid grid-cols-7 gap-4">
            {([1, 2, 3, 4, 5, 6, 7] as TileNumber[]).map((num) => (
              <div key={num}>{renderNumberTile('sou', num)}</div>
            ))}
            <div className="col-start-2">{renderNumberTile('sou', 8)}</div>
            <div>{renderNumberTile('sou', 9)}</div>
            <div className="col-start-5">{renderNumberTile('sou', 5, true)}</div>
          </div>
        )}

        {activeTab === 'honor' && (
          <div className="grid grid-cols-4 gap-4">
            {renderHonorTile('wind', 'east', '東')}
            {renderHonorTile('wind', 'south', '南')}
            {renderHonorTile('wind', 'west', '西')}
            {renderHonorTile('wind', 'north', '北')}
            {renderHonorTile('dragon', 'white', '白')}
            {renderHonorTile('dragon', 'green', '發')}
            {renderHonorTile('dragon', 'red', '中')}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>牌をタップで追加 / 各牌は最大4枚まで選択できます</p>
        </div>
      </div>
    </div>
  )
}
