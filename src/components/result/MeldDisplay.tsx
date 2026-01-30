/**
 * 面子表示コンポーネント
 */

import type { MeldGroup } from '@/core/mahjong'
import { Tile } from '@/components/tiles/Tile'

interface MeldDisplayProps {
  meldGroup: MeldGroup
}

export function MeldDisplay({ meldGroup }: MeldDisplayProps) {
  const getMeldLabel = (meld: typeof meldGroup.melds[number]): string => {
    if ('tiles' in meld && meld.tiles.length === 3) {
      // 順子または刻子
      const firstTile = meld.tiles[0]
      const secondTile = meld.tiles[1]

      if (firstTile.type === secondTile.type &&
          firstTile.type !== 'wind' && firstTile.type !== 'dragon' &&
          firstTile.number === secondTile.number) {
        return '刻子'
      }
      return '順子'
    }
    if ('tiles' in meld && meld.tiles.length === 4) {
      return '槓子'
    }
    return '面子'
  }

  const getMeldBgColor = (meld: typeof meldGroup.melds[number]): string => {
    const label = getMeldLabel(meld)
    if (label === '順子') return 'bg-[#e8f8f5] border-[#16a085]'
    return 'bg-[#fef5e7] border-[#d68910]'
  }

  return (
    <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
      <h3 className="text-lg font-bold text-[#2d5016] mb-4">面子分解</h3>

      <div className="flex flex-wrap gap-4">
        {meldGroup.melds.map((meld, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded border-2 ${getMeldBgColor(meld)}`}
          >
            <p className="text-sm text-center mb-1">{getMeldLabel(meld)}</p>
            <div className="flex gap-1">
              {meld.tiles.map((tile, tileIndex) => (
                <Tile key={tileIndex} tile={tile} size="small" />
              ))}
            </div>
          </div>
        ))}

        {/* 雀頭 */}
        <div className="px-4 py-2 rounded border-2 bg-[#fadbd8] border-[#c0392b]">
          <p className="text-sm text-center mb-1">雀頭</p>
          <div className="flex gap-1">
            {meldGroup.pair.tiles.map((tile, index) => (
              <Tile key={index} tile={tile} size="small" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-[#d5f4e6] rounded">
        <p className="text-sm text-[#27ae60]">
          ✓ 面子分解成功 - 待ち: {getWaitTypeName(meldGroup.wait)}
        </p>
      </div>
    </div>
  )
}

function getWaitTypeName(waitType: string): string {
  const waitTypes: Record<string, string> = {
    ryanmen: '両面待ち',
    kanchan: '嵌張待ち',
    penchan: '辺張待ち',
    shanpon: '双碰待ち',
    tanki: '単騎待ち',
  }
  return waitTypes[waitType] || waitType
}
