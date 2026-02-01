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

/** 赤ドラを区別する牌比較 */
function isSameTile(a: Tile, b: Tile): boolean {
  if (a.type !== b.type) return false
  if (a.type === 'man' || a.type === 'pin' || a.type === 'sou') {
    return a.number === b.number && a.isRed === b.isRed
  }
  if (a.type === 'wind') return a.wind === b.wind
  if (a.type === 'dragon') return a.dragon === b.dragon
  return false
}

export { isSameTile }

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
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#16a085] bg-[#e8f8f5]">
          <span className="text-xs text-[#16a085]">{count}</span>
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
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#16a085] bg-[#e8f8f5]">
          <span className="text-xs text-[#16a085]">{count}</span>
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
      {/* タブ - モバイル用select */}
      <div className="mb-4 sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TileTab)}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          {(['man', 'pin', 'sou', 'honor'] as TileTab[]).map((tab) => (
            <option key={tab} value={tab}>
              {TILE_TAB_LABELS[tab]}
            </option>
          ))}
        </select>
      </div>

      {/* タブ - デスクトップ用ボタングループ */}
      <ul className="mb-4 hidden text-center text-sm font-medium text-slate-400 sm:flex">
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
      <div className="rounded border border-gray-200 bg-white p-4">
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

        <div className="mt-4 text-xs text-[#95a5a6]">
          <p>各牌は最大4枚まで選択できます</p>
        </div>
      </div>
    </div>
  )
}
