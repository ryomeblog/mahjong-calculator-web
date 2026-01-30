/**
 * 符計算表示コンポーネント
 */

import type { FuCalculation as FuCalc } from '@/core/mahjong'

interface FuCalculationProps {
  fuCalculation: FuCalc
}

export function FuCalculation({ fuCalculation }: FuCalculationProps) {
  const breakdown = fuCalculation.breakdown

  return (
    <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
      <h3 className="text-lg font-bold text-[#2d5016] mb-4">符計算</h3>

      <div className="space-y-1 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>副底:</span>
          <span>{breakdown.base}符</span>
        </div>
        {breakdown.melds > 0 && (
          <div className="flex justify-between">
            <span>面子:</span>
            <span>{breakdown.melds}符</span>
          </div>
        )}
        {breakdown.pair > 0 && (
          <div className="flex justify-between">
            <span>雀頭:</span>
            <span>{breakdown.pair}符</span>
          </div>
        )}
        {breakdown.wait > 0 && (
          <div className="flex justify-between">
            <span>待ち:</span>
            <span>{breakdown.wait}符</span>
          </div>
        )}
        {breakdown.tsumo > 0 && (
          <div className="flex justify-between">
            <span>ツモ:</span>
            <span>{breakdown.tsumo}符</span>
          </div>
        )}
        {breakdown.concealed > 0 && (
          <div className="flex justify-between">
            <span>門前ロン:</span>
            <span>{breakdown.concealed}符</span>
          </div>
        )}
      </div>

      <hr className="my-3 border-gray-300" />

      <div className="bg-[#aed6f1] px-4 py-2 rounded">
        <div className="flex justify-between items-center">
          <span className="text-[#2d5016] font-bold">合計:</span>
          <span className="text-[#2d5016] font-bold text-lg">{fuCalculation.total}符</span>
        </div>
      </div>
    </div>
  )
}
