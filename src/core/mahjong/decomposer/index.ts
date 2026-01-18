/**
 * 面子分解の公開API
 */

export { decomposeStandard } from './standard'
export { detectSpecialForms, detectKokushi, detectChiitoitsu } from './special'
export { detectWaitType } from './wait-detector'
export {
  tileToIndex,
  indexToTile,
  tilesToCounts,
  countsToTiles,
  countsToKey,
} from './tile-converter'
