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

export function WindSelector({
  label,
  selectedWind,
  onChange,
}: WindSelectorProps) {
  const winds: Wind[] = ['east', 'south', 'west', 'north']

  return (
    <div className="flex-1">
      <h4 className="mb-3 text-base font-semibold text-gray-800">{label}</h4>
      <div className="inline-flex w-full gap-2">
        {winds.map((wind) => (
          <button
            key={wind}
            type="button"
            onClick={() => onChange(wind)}
            className={`flex-1 rounded-lg border-2 py-2.5 text-base font-semibold transition-all sm:text-lg ${
              selectedWind === wind
                ? 'border-gray-900 bg-white text-black shadow-md'
                : 'border-gray-300 bg-white text-black hover:border-gray-400'
            }`}
          >
            {WIND_LABELS[wind]}
          </button>
        ))}
      </div>
    </div>
  )
}
