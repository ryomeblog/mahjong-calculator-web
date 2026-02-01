/**
 * 役リスト表示コンポーネント
 */

import type { YakuItem } from '@/core/mahjong'

interface YakuListProps {
  yakuList: readonly YakuItem[]
  totalHan: number
}

export function YakuList({ yakuList, totalHan }: YakuListProps) {
  const getYakuName = (yakuName: string): string => {
    const yakuNames: Record<string, string> = {
      riichi: 'リーチ',
      'double-riichi': 'ダブルリーチ',
      ippatsu: '一発',
      tsumo: 'ツモ',
      tanyao: 'タンヤオ',
      pinfu: '平和',
      iipeikou: '一盃口',
      'yakuhai-wind': '役牌（風牌）',
      'yakuhai-dragon': '役牌（三元牌）',
      haitei: '海底摸月',
      houtei: '河底撈魚',
      rinshan: '嶺上開花',
      chankan: '槍槓',
      chanta: 'チャンタ',
      ikkitsuukan: '一気通貫',
      sanshoku: '三色同順',
      'sanshoku-doukou': '三色同刻',
      'san-kantsu': '三槓子',
      toitoi: '対々和',
      'san-ankou': '三暗刻',
      'shou-sangen': '小三元',
      honroutou: '混老頭',
      ryanpeikou: '二盃口',
      junchan: '純チャン',
      honitsu: '混一色',
      chinitsu: '清一色',
      kokushi: '国士無双',
      'kokushi-13': '国士無双十三面待ち',
      'suu-ankou': '四暗刻',
      'suu-ankou-tanki': '四暗刻単騎',
      daisangen: '大三元',
      'shou-suushii': '小四喜',
      'dai-suushii': '大四喜',
      tsuuiisou: '字一色',
      chinroutou: '清老頭',
      ryuuiisou: '緑一色',
      'chuuren-poutou': '九蓮宝燈',
      'junsei-chuuren': '純正九蓮宝燈',
      'suu-kantsu': '四槓子',
      tenhou: '天和',
      chiihou: '地和',
    }
    return yakuNames[yakuName] || yakuName
  }

  return (
    <div className="bg-white rounded-lg p-5 border-2 border-[#2d5016]">
      <h3 className="text-lg font-bold text-[#2d5016] mb-4">役判定</h3>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          {yakuList.map((yaku, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-[#e8f6f3] border border-[#16a085] rounded flex justify-between items-center"
            >
              <span className="text-[#2d5016]">{getYakuName(yaku.name)}</span>
              <span className="text-[#16a085] font-bold">{yaku.han}翻</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-[#fff3cd] border-2 border-[#f39c12] rounded p-6 flex flex-col justify-center items-center sm:w-80">
          <p className="text-[#2d5016] text-lg mb-2">合計翻数</p>
          <p className="text-[#f39c12] text-5xl font-bold">{totalHan}翻</p>
        </div>
      </div>
    </div>
  )
}
