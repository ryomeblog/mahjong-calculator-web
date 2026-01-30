/**
 * 選択済み手牌表示コンポーネント
 */

import type { Tile as TileType } from '@/core/mahjong'
import { Tile } from './Tile'

interface SelectedTilesProps {
  tiles: readonly TileType[]
  winningTile: TileType | null
  onRemoveTile?: (index: number) => void
}

export function SelectedTiles({ tiles, winningTile, onRemoveTile }: SelectedTilesProps) {
  const tileCount = tiles.length

  return (
    <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
      <div className="mb-3">
        <h3 className="text-[#2d5016] font-bold">
          現在の手牌（{tileCount} / 14枚）
        </h3>
      </div>

      <div className="bg-[#1a3a0f] rounded min-h-[85px] p-2 flex items-center justify-center">
        {tileCount === 0 ? (
          <p className="text-gray-400 text-sm">
            下の牌選択パネルから牌をタップして追加してください
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tiles.map((tile, index) => (
              <Tile
                key={index}
                tile={tile}
                size="small"
                onClick={onRemoveTile ? () => onRemoveTile(index) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {winningTile && (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-[#2d5016] mb-2">和了牌</h4>
          <Tile tile={winningTile} isWinning size="small" />
        </div>
      )}
    </div>
  )
}
