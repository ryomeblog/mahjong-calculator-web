/**
 * SVG形式の麻雀牌コンポーネント
 */

import type { Tile as TileType } from '@/core/mahjong'

interface TileSvgProps {
  tile: TileType
  isWinning?: boolean
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export function TileSvg({ tile, isWinning = false, size = 'medium', onClick }: TileSvgProps) {
  const sizeMap = {
    small: { width: 40, height: 56, fontSize: 24 },
    medium: { width: 48, height: 64, fontSize: 28 },
    large: { width: 64, height: 88, fontSize: 36 },
  }

  const { width, height, fontSize } = sizeMap[size]

  const renderManTile = (num: number) => {
    const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
    return (
      <>
        <text
          x={width / 2}
          y={height * 0.45}
          fontSize={fontSize}
          fill="#c0392b"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="serif"
        >
          {numbers[num - 1]}
        </text>
        <text
          x={width / 2}
          y={height * 0.75}
          fontSize={fontSize * 0.7}
          fill="#c0392b"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="serif"
        >
          萬
        </text>
      </>
    )
  }

  const renderPinTile = (num: number) => {
    const positions: Record<number, { x: number; y: number }[]> = {
      1: [{ x: 0.5, y: 0.5 }],
      2: [
        { x: 0.5, y: 0.35 },
        { x: 0.5, y: 0.65 },
      ],
      3: [
        { x: 0.5, y: 0.3 },
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.7 },
      ],
      4: [
        { x: 0.35, y: 0.35 },
        { x: 0.65, y: 0.35 },
        { x: 0.35, y: 0.65 },
        { x: 0.65, y: 0.65 },
      ],
      5: [
        { x: 0.3, y: 0.3 },
        { x: 0.7, y: 0.3 },
        { x: 0.5, y: 0.5 },
        { x: 0.3, y: 0.7 },
        { x: 0.7, y: 0.7 },
      ],
      6: [
        { x: 0.3, y: 0.3 },
        { x: 0.7, y: 0.3 },
        { x: 0.3, y: 0.5 },
        { x: 0.7, y: 0.5 },
        { x: 0.3, y: 0.7 },
        { x: 0.7, y: 0.7 },
      ],
      7: [
        { x: 0.3, y: 0.25 },
        { x: 0.7, y: 0.25 },
        { x: 0.5, y: 0.42 },
        { x: 0.3, y: 0.58 },
        { x: 0.7, y: 0.58 },
        { x: 0.3, y: 0.75 },
        { x: 0.7, y: 0.75 },
      ],
      8: [
        { x: 0.3, y: 0.22 },
        { x: 0.7, y: 0.22 },
        { x: 0.3, y: 0.42 },
        { x: 0.7, y: 0.42 },
        { x: 0.3, y: 0.58 },
        { x: 0.7, y: 0.58 },
        { x: 0.3, y: 0.78 },
        { x: 0.7, y: 0.78 },
      ],
      9: [
        { x: 0.3, y: 0.25 },
        { x: 0.5, y: 0.25 },
        { x: 0.7, y: 0.25 },
        { x: 0.3, y: 0.5 },
        { x: 0.5, y: 0.5 },
        { x: 0.7, y: 0.5 },
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 },
      ],
    }

    const circles = positions[num] || []
    const radius = width * 0.08

    return (
      <>
        {circles.map((pos, index) => (
          <circle
            key={index}
            cx={pos.x * width}
            cy={pos.y * height}
            r={radius}
            fill="#2471a3"
            stroke="#2471a3"
            strokeWidth="1"
          />
        ))}
      </>
    )
  }

  const renderSouTile = (num: number) => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    return (
      <>
        <rect
          x={width * 0.25}
          y={height * 0.25}
          width={width * 0.5}
          height={height * 0.5}
          fill="none"
          stroke="#27ae60"
          strokeWidth="2"
          rx="3"
        />
        <text
          x={width / 2}
          y={height * 0.6}
          fontSize={fontSize * 0.8}
          fill="#27ae60"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="serif"
        >
          {numbers[num - 1]}
        </text>
      </>
    )
  }

  const renderWindTile = (wind: string) => {
    const windChars: Record<string, string> = {
      east: '東',
      south: '南',
      west: '西',
      north: '北',
    }
    return (
      <text
        x={width / 2}
        y={height * 0.6}
        fontSize={fontSize}
        fill="#000"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="serif"
      >
        {windChars[wind]}
      </text>
    )
  }

  const renderDragonTile = (dragon: string) => {
    const dragonChars: Record<string, string> = {
      white: '白',
      green: '發',
      red: '中',
    }
    const dragonColors: Record<string, string> = {
      white: '#000',
      green: '#27ae60',
      red: '#c0392b',
    }
    return (
      <text
        x={width / 2}
        y={height * 0.6}
        fontSize={fontSize}
        fill={dragonColors[dragon]}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="serif"
      >
        {dragonChars[dragon]}
      </text>
    )
  }

  const renderTileContent = () => {
    if (tile.type === 'man' && tile.number) {
      return renderManTile(tile.number)
    }
    if (tile.type === 'pin' && tile.number) {
      return renderPinTile(tile.number)
    }
    if (tile.type === 'sou' && tile.number) {
      return renderSouTile(tile.number)
    }
    if (tile.type === 'wind' && tile.wind) {
      return renderWindTile(tile.wind)
    }
    if (tile.type === 'dragon' && tile.dragon) {
      return renderDragonTile(tile.dragon)
    }
    return null
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:opacity-80' : ''}
      style={{ display: 'block' }}
    >
      {/* 牌の背景 */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={isWinning ? '#fff9c4' : '#fef9e7'}
        stroke={isWinning ? '#f39c12' : '#2d5016'}
        strokeWidth={isWinning ? '3' : '2'}
        rx="3"
      />

      {/* 牌の内容 */}
      {renderTileContent()}

      {/* 赤ドラマーク */}
      {tile.isRed && (
        <>
          <circle cx={width * 0.5} cy={height * 0.15} r={width * 0.1} fill="#e74c3c" />
          <text
            x={width / 2}
            y={height * 0.92}
            fontSize={fontSize * 0.3}
            fill="#e67e22"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            赤
          </text>
        </>
      )}
    </svg>
  )
}
