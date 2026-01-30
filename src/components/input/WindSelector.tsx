/**
 * 場風・自風選択コンポーネント
 */

import type { Wind } from '@/core/mahjong'
import { WIND_LABELS } from '@/types/ui'

interface WindSelectorProps {
  label: string
  selectedWind: Wind
  onChange: (wind: Wind) => void
}

export function WindSelector({ label, selectedWind, onChange }: WindSelectorProps) {
  const winds: Wind[] = ['east', 'south', 'west', 'north']

  return (
    <div>
      <h4 className="text-sm font-bold text-[#2d5016] mb-2">{label}</h4>
      <div className="flex gap-2">
        {winds.map((wind) => (
          <button
            key={wind}
            type="button"
            onClick={() => onChange(wind)}
            className={`
              w-[70px] h-[60px] rounded text-2xl font-bold font-serif
              ${
                selectedWind === wind
                  ? 'bg-[#3498db] text-white border-2 border-[#2471a3]'
                  : 'bg-gray-300 text-gray-600'
              }
              hover:opacity-80 cursor-pointer
            `}
          >
            {WIND_LABELS[wind]}
          </button>
        ))}
      </div>
    </div>
  )
}
