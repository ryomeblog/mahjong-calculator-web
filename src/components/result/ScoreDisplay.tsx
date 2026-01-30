/**
 * 点数表示コンポーネント
 */

import type { ScoreCalculation } from '@/core/mahjong'

interface ScoreDisplayProps {
  scoreCalculation: ScoreCalculation
  isDealer: boolean
}

export function ScoreDisplay({ scoreCalculation, isDealer }: ScoreDisplayProps) {
  const getLimitHandName = (limitHandName: string): string => {
    const limitHandNames: Record<string, string> = {
      mangan: '満貫',
      haneman: '跳満',
      baiman: '倍満',
      sanbaiman: '三倍満',
      yakuman: '役満',
      'double-yakuman': '二倍役満',
      'triple-yakuman': '三倍役満',
    }
    return limitHandNames[limitHandName] || ''
  }

  const getScoreText = (): string => {
    const { payment } = scoreCalculation

    if ('ron' in payment && payment.ron !== undefined) {
      return `${payment.ron.toLocaleString()}点`
    }

    if ('tsumoEach' in payment && payment.tsumoEach !== undefined) {
      // 親のツモ
      return `${payment.tsumoEach.toLocaleString()}点オール`
    }

    if ('tsumoDealer' in payment && 'tsumoNonDealer' in payment &&
        payment.tsumoDealer !== undefined && payment.tsumoNonDealer !== undefined) {
      // 子のツモ
      return `${payment.tsumoDealer.toLocaleString()}点 / ${payment.tsumoNonDealer.toLocaleString()}点`
    }

    return ''
  }

  const getScoreDetail = (): string => {
    const { payment } = scoreCalculation

    if ('ron' in payment) {
      return isDealer ? '(親ロン)' : '(子ロン)'
    }

    if ('tsumoEach' in payment) {
      return '(親のツモ - 子全員)'
    }

    if ('tsumoDealer' in payment && 'tsumoNonDealer' in payment) {
      return '(子のツモ - 親 / 子)'
    }

    return ''
  }

  return (
    <div className="bg-[#2d5016] rounded-lg p-5">
      <h3 className="text-white text-lg font-bold mb-4">点数計算結果</h3>

      <div className="bg-white rounded p-6 text-center">
        {scoreCalculation.isLimitHand && scoreCalculation.limitHandName && (
          <p className="text-gray-700 text-lg mb-2">
            {getLimitHandName(scoreCalculation.limitHandName)}
          </p>
        )}

        <p className="text-[#c0392b] text-5xl font-bold mb-2">{getScoreText()}</p>

        <p className="text-gray-500 text-sm">{getScoreDetail()}</p>
      </div>
    </div>
  )
}
