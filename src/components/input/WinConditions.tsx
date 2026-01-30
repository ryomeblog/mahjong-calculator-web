/**
 * 和了条件入力コンポーネント
 */

interface WinConditionsProps {
  isTsumo: boolean
  isRiichi: boolean
  isDoubleRiichi: boolean
  onToggleTsumo: () => void
  onToggleRiichi: () => void
  onToggleDoubleRiichi: () => void
}

export function WinConditions({
  isTsumo,
  isRiichi,
  isDoubleRiichi,
  onToggleTsumo,
  onToggleRiichi,
  onToggleDoubleRiichi,
}: WinConditionsProps) {
  return (
    <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
      <h3 className="text-sm font-bold text-[#2d5016] mb-3">和了方法</h3>

      <div className="flex flex-wrap gap-2">
        {/* ツモ/ロンボタン */}
        <button
          type="button"
          onClick={onToggleTsumo}
          className={`
            px-6 py-3 rounded-md text-lg font-bold
            ${
              isTsumo
                ? 'bg-[#3498db] text-white border-2 border-[#2471a3]'
                : 'bg-gray-300 text-gray-600'
            }
            hover:opacity-80 cursor-pointer
          `}
        >
          ツモ
        </button>
        <button
          type="button"
          onClick={onToggleTsumo}
          className={`
            px-6 py-3 rounded-md text-lg font-bold
            ${
              !isTsumo
                ? 'bg-[#3498db] text-white border-2 border-[#2471a3]'
                : 'bg-gray-300 text-gray-600'
            }
            hover:opacity-80 cursor-pointer
          `}
        >
          ロン
        </button>

        {/* リーチボタン */}
        <button
          type="button"
          onClick={onToggleRiichi}
          className={`
            px-6 py-3 rounded-md text-lg
            ${
              isRiichi
                ? 'bg-[#3498db] text-white border-2 border-[#2471a3]'
                : 'bg-gray-300 text-gray-600'
            }
            hover:opacity-80 cursor-pointer
          `}
        >
          リーチ
        </button>

        {/* ダブルリーチボタン */}
        <button
          type="button"
          onClick={onToggleDoubleRiichi}
          className={`
            px-6 py-3 rounded-md text-lg
            ${
              isDoubleRiichi
                ? 'bg-[#3498db] text-white border-2 border-[#2471a3]'
                : 'bg-gray-300 text-gray-600'
            }
            hover:opacity-80 cursor-pointer
          `}
        >
          ダブルリーチ
        </button>
      </div>
    </div>
  )
}
