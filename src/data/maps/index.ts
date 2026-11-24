import type { MapData } from '../../types';
import {
  BRAZELL_COURTYARD_BOSS,
  BRAZELL_ESTATE_DUNGEON,
  CASTLE_SECRET_TUNNELS,
  COMMANDER_DINING_HALL,
  validateMapIntegrity,
} from './act0_ixia';
import {
  FULGOR_CITADEL_GATE,
  GREENBLADE_OUTSKIRTS,
  GREENBLADE_TOWN,
  SOUTHERN_BORDER_CHECKPOINT,
} from './act1_sitia';

export const MAPS_BY_ID: Record<string, MapData> = {
  [COMMANDER_DINING_HALL.mapId]: COMMANDER_DINING_HALL,
  [CASTLE_SECRET_TUNNELS.mapId]: CASTLE_SECRET_TUNNELS,
  [BRAZELL_ESTATE_DUNGEON.mapId]: BRAZELL_ESTATE_DUNGEON,
  [BRAZELL_COURTYARD_BOSS.mapId]: BRAZELL_COURTYARD_BOSS,
  [SOUTHERN_BORDER_CHECKPOINT.mapId]: SOUTHERN_BORDER_CHECKPOINT,
  [GREENBLADE_OUTSKIRTS.mapId]: GREENBLADE_OUTSKIRTS,
  [GREENBLADE_TOWN.mapId]: GREENBLADE_TOWN,
  [FULGOR_CITADEL_GATE.mapId]: FULGOR_CITADEL_GATE,
};

// Enforce AGENTS_TS.md Map Integrity Laws across every registered map
for (const map of Object.values(MAPS_BY_ID)) {
  const report = validateMapIntegrity(map);
  if (!report.valid) {
    throw new Error(
      `Map integrity check failed for "${map.mapId}": ${report.errors.join(' | ')}`
    );
  }
}

export {
  BRAZELL_COURTYARD_BOSS,
  BRAZELL_ESTATE_DUNGEON,
  CASTLE_SECRET_TUNNELS,
  COMMANDER_DINING_HALL,
  TILE_SIZE,
  validateMapIntegrity,
} from './act0_ixia';
export {
  FULGOR_CITADEL_GATE,
  GREENBLADE_OUTSKIRTS,
  GREENBLADE_TOWN,
  SOUTHERN_BORDER_CHECKPOINT,
} from './act1_sitia';
