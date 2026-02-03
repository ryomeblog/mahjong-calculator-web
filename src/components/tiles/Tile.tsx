/**
 * 牌表示コンポーネント
 */

import type { Tile as TileType } from '@/core/mahjong'
import { TileSvg } from './TileSvg'

interface TileProps {
  tile: TileType
  isWinning?: boolean
  isDora?: boolean
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export function Tile({
  tile,
  isWinning = false,
  isDora = false,
  size = 'medium',
  onClick,
}: TileProps) {
  return (
    <div className="inline-block">
      <TileSvg
        tile={tile}
        isWinning={isWinning}
        isDora={isDora}
        size={size}
        onClick={onClick}
      />
    </div>
  )
}
