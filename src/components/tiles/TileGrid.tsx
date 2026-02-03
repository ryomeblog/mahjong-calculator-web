/**
 * 牌選択グリッドコンポーネント（タブ付き）
 * TileSelectModal 内で使用される再利用可能なグリッド
 */

import { useState } from 'react'
import type {
  Tile,
  TileType as CoreTileType,
  TileNumber,
  Wind,
  Dragon,
} from '@/core/mahjong'
import type { TileTab } from '@/types/ui'
import { TILE_TAB_LABELS } from '@/types/ui'
import { TileSvg } from './TileSvg'
import { isSameTile } from '@/utils/tileUtils'

interface TileGridProps {
  /** 他のエリアで既に使用中の牌（グローバルカウント用） */
  readonly globalTiles: readonly Tile[]
  /** 現在のモーダルセッションで選択中の牌 */
  readonly stagingTiles: readonly Tile[]
  /** 牌タップ時のコールバック */
  readonly onTileSelect: (tile: Tile) => void
  /** このセッションで選択可能な最大枚数 */
  readonly maxTiles: number
}

export function TileGrid({
  globalTiles,
  stagingTiles,
  onTileSelect,
  maxTiles,
}: TileGridProps) {
  const [activeTab, setActiveTab] = useState<TileTab>('man')

  const getTileCount = (tile: Tile): number => {
    const globalCount = globalTiles.filter((t) => isSameTile(t, tile)).length
    const stagingCount = stagingTiles.filter((t) => isSameTile(t, tile)).length
    return globalCount + stagingCount
  }

  const canAddTile = (tile: Tile): boolean => {
    if (stagingTiles.length >= maxTiles) return false
    return getTileCount(tile) < 4
  }

  const handleTileClick = (tile: Tile) => {
    if (canAddTile(tile)) {
      onTileSelect(tile)
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
      <div className="flex flex-col items-center gap-2">
        <div
          onClick={() => !disabled && handleTileClick(tile)}
          className={`${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
        >
          <TileSvg tile={tile} size="medium" />
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-900/30">
          <span className="text-xs text-teal-400">{count}</span>
        </div>
      </div>
    )
  }

  const renderHonorTile = (
    tileType: 'wind' | 'dragon',
    value: Wind | Dragon
  ) => {
    const tile: Tile =
      tileType === 'wind'
        ? { type: 'wind', wind: value as Wind }
        : { type: 'dragon', dragon: value as Dragon }
    const count = getTileCount(tile)
    const disabled = !canAddTile(tile)

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          onClick={() => !disabled && handleTileClick(tile)}
          className={`${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
        >
          <TileSvg tile={tile} size="medium" />
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-teal-500 bg-teal-900/30">
          <span className="text-xs text-teal-400">{count}</span>
        </div>
      </div>
    )
  }

  const renderNumberPanel = (type: CoreTileType) => (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as TileNumber[]).map((num) => (
        <div key={num}>{renderNumberTile(type, num)}</div>
      ))}
      <div>{renderNumberTile(type, 5, true)}</div>
    </div>
  )

  return (
    <div>
      {/* タブ切り替え */}
      <ul className="mb-4 flex text-center text-sm font-medium text-slate-400">
        {(['man', 'pin', 'sou', 'honor'] as TileTab[]).map((tab, index) => {
          const isFirst = index === 0
          const isLast = index === 3
          const isActive = activeTab === tab

          return (
            <li key={tab} className="w-full">
              <div
                onClick={() => setActiveTab(tab)}
                className={`inline-flex w-full cursor-pointer items-center justify-center border border-slate-600 px-4 py-2.5 text-sm leading-5 font-medium transition-colors ${
                  isFirst ? 'rounded-s-lg' : ''
                } ${isLast ? 'rounded-e-lg' : ''} ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {TILE_TAB_LABELS[tab]}
              </div>
            </li>
          )
        })}
      </ul>

      {/* 牌パネル */}
      <div className="rounded border border-slate-700 bg-slate-900 p-4">
        {activeTab === 'man' && renderNumberPanel('man')}
        {activeTab === 'pin' && renderNumberPanel('pin')}
        {activeTab === 'sou' && renderNumberPanel('sou')}

        {activeTab === 'honor' && (
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {renderHonorTile('wind', 'east')}
            {renderHonorTile('wind', 'south')}
            {renderHonorTile('wind', 'west')}
            {renderHonorTile('wind', 'north')}
            {renderHonorTile('dragon', 'white')}
            {renderHonorTile('dragon', 'green')}
            {renderHonorTile('dragon', 'red')}
          </div>
        )}
      </div>
    </div>
  )
}
