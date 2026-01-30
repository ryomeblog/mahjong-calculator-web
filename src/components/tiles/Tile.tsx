/**
 * 牌表示コンポーネント
 */

import type { Tile as TileType } from '@/core/mahjong'
import { TileSvg } from './TileSvg'

interface TileProps {
  tile: TileType
  isWinning?: boolean
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export function Tile({ tile, isWinning = false, size = 'medium', onClick }: TileProps) {
  return (
    <div className="inline-block">
      <TileSvg tile={tile} isWinning={isWinning} size={size} onClick={onClick} />
    </div>
  )
}
