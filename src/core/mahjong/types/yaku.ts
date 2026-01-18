/**
 * 役の型定義
 */

/**
 * 役の名前（すべての役）
 */
export type YakuName =
  // 1翻役
  | 'riichi' // 立直
  | 'ippatsu' // 一発
  | 'tsumo' // 門前清自摸和
  | 'tanyao' // 断么九
  | 'pinfu' // 平和
  | 'iipeikou' // 一盃口
  | 'yakuhai-wind' // 役牌（風牌）
  | 'yakuhai-dragon' // 役牌（三元牌）
  | 'haitei' // 海底撈月
  | 'houtei' // 河底撈魚
  | 'rinshan' // 嶺上開花
  | 'chankan' // 槍槓

  // 2翻役
  | 'double-riichi' // 両立直
  | 'chiitoitsu' // 七対子
  | 'chanta' // 混全帯么九
  | 'ikkitsuukan' // 一気通貫
  | 'sanshoku-doujun' // 三色同順
  | 'sanshoku-doukou' // 三色同刻
  | 'sankantsu' // 三槓子
  | 'toitoi' // 対々和
  | 'sanankou' // 三暗刻
  | 'shousangen' // 小三元
  | 'honroutou' // 混老頭

  // 3翻役
  | 'ryanpeikou' // 二盃口
  | 'junchan' // 純全帯么九

  // 6翻役
  | 'honitsu' // 混一色
  | 'chinitsu' // 清一色

  // 役満
  | 'kokushi' // 国士無双
  | 'kokushi-13' // 国士無双十三面待ち
  | 'suuankou' // 四暗刻
  | 'suuankou-tanki' // 四暗刻単騎
  | 'daisangen' // 大三元
  | 'shousuushii' // 小四喜
  | 'daisuushii' // 大四喜
  | 'tsuuiisou' // 字一色
  | 'chinroutou' // 清老頭
  | 'ryuuiisou' // 緑一色
  | 'chuuren' // 九蓮宝燈
  | 'chuuren-9' // 純正九蓮宝燈
  | 'suukantsu' // 四槓子
  | 'tenhou' // 天和
  | 'chiihou' // 地和

/**
 * 役のアイテム
 */
export interface YakuItem {
  /** 役の名前 */
  readonly name: YakuName

  /** 翻数 */
  readonly han: number

  /** 日本語名 */
  readonly displayName: string

  /** 役満かどうか */
  readonly isYakuman: boolean

  /** 食い下がりの翻数（鳴いた場合） */
  readonly openHan?: number
}

/**
 * 役のカテゴリー
 */
export type YakuCategory =
  | 'situational' // 状況役（リーチ、ツモなど）
  | 'hand' // 手役（タンヤオ、ピンフなど）
  | 'color' // 色役（ホンイツ、チンイツ）
  | 'terminal' // 么九役（チャンタ、ジュンチャンなど）
  | 'yakuman' // 役満

/**
 * 役の定義
 */
export interface YakuDefinition {
  readonly name: YakuName
  readonly displayName: string
  readonly han: number
  readonly openHan: number | null
  readonly category: YakuCategory
  readonly isYakuman: boolean
  readonly description: string
}
