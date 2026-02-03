/**
 * 役判定メイン処理
 */

import type { MeldGroup, WinningConditions, YakuItem } from '../types'
import { YAKU_DEFINITIONS } from '../constants'

// 実装済みの役
// 1翻役
import { isTanyao } from './one-han/tanyao'
import { isPinfu } from './one-han/pinfu'
import { isIipeikou } from './one-han/iipeikou'
import { countYakuhaiWind, countYakuhaiDragon } from './one-han/yakuhai'

// 2翻役
import { isToitoi } from './two-han/toitoi'
import { isChanta } from './two-han/chanta'
import { isIkkitsuukan } from './two-han/ikkitsuukan'
import { isSanshokuDoujun } from './two-han/sanshoku-doujun'
import { isSanshokuDoukou } from './two-han/sanshoku-doukou'
import { isSankantsu } from './two-han/sankantsu'
import { isSanankou } from './two-han/sanankou'
import { isShousangen } from './two-han/shousangen'
import { isHonroutou } from './two-han/honroutou'

// 3翻役
import { isRyanpeikou } from './three-han/ryanpeikou'
import { isJunchan } from './three-han/junchan'
import { isHonitsu } from './three-han/honitsu'

// 6翻役
import { isChinitsu } from './six-han/chinitsu'

// 役満
import { isDaisangen } from './yakuman/daisangen'
import { isSuuankou, isSuuankouTanki } from './yakuman/suuankou'
import { isShousuushii, isDaisuushii } from './yakuman/shousuushii'
import { isTsuuiisou } from './yakuman/tsuuiisou'
import { isChinroutou } from './yakuman/chinroutou'
import { isRyuuiisou } from './yakuman/ryuuiisou'
import { isChuuren, isChuuren9 } from './yakuman/chuuren'
import { isSuukantsu } from './yakuman/suukantsu'

/**
 * 役を判定
 *
 * @param meldGroup - 面子分解結果
 * @param conditions - 和了条件
 * @returns 役の配列
 */
export function detectYaku(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): YakuItem[] {
  const yaku: YakuItem[] = []

  // 鳴いているかどうかを判定（面子に一つでも明刻・明槓があれば鳴いている）
  const isOpen = !meldGroup.melds.every((m) => m.isConcealed)

  // 1. 役満を先にチェック
  const yakumanList = detectYakuman(meldGroup, conditions)
  if (yakumanList.length > 0) {
    return yakumanList // 役満があれば通常役は含めない
  }

  // 2. 特殊形の役
  // 七対子
  if (meldGroup.isSpecial && meldGroup.specialType === 'chiitoitsu') {
    yaku.push(createYakuItem('chiitoitsu'))
  }

  // 3. 状況役
  if (conditions.isDoubleRiichi) {
    yaku.push(createYakuItem('double-riichi'))
  } else if (conditions.isRiichi) {
    yaku.push(createYakuItem('riichi'))
  }

  if (conditions.isIppatsu) {
    yaku.push(createYakuItem('ippatsu'))
  }

  if (conditions.isTsumo && meldGroup.melds.every((m) => m.isConcealed)) {
    yaku.push(createYakuItem('tsumo'))
  }

  if (conditions.isHaitei) {
    yaku.push(createYakuItem('haitei'))
  }

  if (conditions.isHoutei) {
    yaku.push(createYakuItem('houtei'))
  }

  if (conditions.isRinshan) {
    yaku.push(createYakuItem('rinshan'))
  }

  if (conditions.isChankan) {
    yaku.push(createYakuItem('chankan'))
  }

  // 3. 手役
  // 6翻役（優先度高）
  if (isChinitsu(meldGroup)) {
    yaku.push(createYakuItem('chinitsu', isOpen))
  }

  // 3翻役
  if (isHonitsu(meldGroup)) {
    yaku.push(createYakuItem('honitsu', isOpen))
  }

  if (isJunchan(meldGroup)) {
    yaku.push(createYakuItem('junchan', isOpen))
  }

  if (isRyanpeikou(meldGroup)) {
    yaku.push(createYakuItem('ryanpeikou', isOpen))
  }

  // 2翻役
  if (isChanta(meldGroup)) {
    yaku.push(createYakuItem('chanta', isOpen))
  }

  if (isIkkitsuukan(meldGroup)) {
    yaku.push(createYakuItem('ikkitsuukan', isOpen))
  }

  if (isSanshokuDoujun(meldGroup)) {
    yaku.push(createYakuItem('sanshoku-doujun', isOpen))
  }

  if (isSanshokuDoukou(meldGroup)) {
    yaku.push(createYakuItem('sanshoku-doukou', isOpen))
  }

  if (isSankantsu(meldGroup)) {
    yaku.push(createYakuItem('sankantsu', isOpen))
  }

  if (isToitoi(meldGroup)) {
    yaku.push(createYakuItem('toitoi', isOpen))
  }

  if (isSanankou(meldGroup)) {
    yaku.push(createYakuItem('sanankou', isOpen))
  }

  if (isShousangen(meldGroup)) {
    yaku.push(createYakuItem('shousangen', isOpen))
  }

  if (isHonroutou(meldGroup)) {
    yaku.push(createYakuItem('honroutou', isOpen))
  }

  // 1翻役
  if (isTanyao(meldGroup)) {
    yaku.push(createYakuItem('tanyao', isOpen))
  }

  if (isPinfu(meldGroup, conditions)) {
    yaku.push(createYakuItem('pinfu', isOpen))
  }

  if (isIipeikou(meldGroup)) {
    yaku.push(createYakuItem('iipeikou', isOpen))
  }

  // 役牌（風牌）
  const yakuhaiWindCount = countYakuhaiWind(meldGroup, conditions)
  for (let i = 0; i < yakuhaiWindCount; i++) {
    yaku.push(createYakuItem('yakuhai-wind', isOpen))
  }

  // 役牌（三元牌）
  const yakuhaiDragonCount = countYakuhaiDragon(meldGroup)
  for (let i = 0; i < yakuhaiDragonCount; i++) {
    yaku.push(createYakuItem('yakuhai-dragon', isOpen))
  }

  // 役がない場合はエラー
  if (yaku.length === 0) {
    throw new Error('役がありません')
  }

  return yaku
}

/**
 * 役満を判定
 */
function detectYakuman(
  meldGroup: MeldGroup,
  conditions: WinningConditions
): YakuItem[] {
  const yakuman: YakuItem[] = []

  // 天和・地和
  if (conditions.isTenhou) {
    yakuman.push(createYakuItem('tenhou'))
    return yakuman
  }

  if (conditions.isChiihou) {
    yakuman.push(createYakuItem('chiihou'))
    return yakuman
  }

  // 国士無双（特殊形で判定済み）
  if (meldGroup.isSpecial && meldGroup.specialType === 'kokushi') {
    yakuman.push(createYakuItem('kokushi'))
    return yakuman
  }

  // ダブル役満チェック（優先度高）
  if (isChuuren9(meldGroup)) {
    yakuman.push(createYakuItem('chuuren-9'))
    return yakuman
  }

  if (isSuuankouTanki(meldGroup)) {
    yakuman.push(createYakuItem('suuankou-tanki'))
    return yakuman
  }

  if (isDaisuushii(meldGroup)) {
    yakuman.push(createYakuItem('daisuushii'))
    return yakuman
  }

  // 通常役満
  if (isChuuren(meldGroup)) {
    yakuman.push(createYakuItem('chuuren'))
  }

  if (isSuuankou(meldGroup)) {
    yakuman.push(createYakuItem('suuankou'))
  }

  if (isDaisangen(meldGroup)) {
    yakuman.push(createYakuItem('daisangen'))
  }

  if (isShousuushii(meldGroup)) {
    yakuman.push(createYakuItem('shousuushii'))
  }

  if (isTsuuiisou(meldGroup)) {
    yakuman.push(createYakuItem('tsuuiisou'))
  }

  if (isChinroutou(meldGroup)) {
    yakuman.push(createYakuItem('chinroutou'))
  }

  if (isRyuuiisou(meldGroup)) {
    yakuman.push(createYakuItem('ryuuiisou'))
  }

  if (isSuukantsu(meldGroup)) {
    yakuman.push(createYakuItem('suukantsu'))
  }

  return yakuman
}

/**
 * YakuItemを作成
 */
function createYakuItem(
  name: keyof typeof YAKU_DEFINITIONS,
  isOpen: boolean = false
): YakuItem {
  const def = YAKU_DEFINITIONS[name]

  // 鳴いている場合で、openHanが定義されている場合は、openHanを使用
  const han =
    isOpen && def.openHan !== null && def.openHan !== undefined
      ? def.openHan
      : def.han

  return {
    name: def.name,
    han,
    displayName: def.displayName,
    isYakuman: def.isYakuman,
    openHan: def.openHan ?? undefined,
  }
}

/**
 * 翻数を計算
 *
 * @param yaku - 役の配列
 * @param conditions - 和了条件
 * @returns 合計翻数
 */
export function calculateHan(
  yaku: readonly YakuItem[],
  conditions: WinningConditions
): number {
  // 役の翻数を合計
  const yakuHan = yaku.reduce((sum, y) => sum + y.han, 0)

  // ドラの翻数
  const doraHan =
    conditions.doraCount + conditions.uraDoraCount + conditions.redDoraCount

  return yakuHan + doraHan
}
