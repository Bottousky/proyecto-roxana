import plazaUrl from '../../assets/ohmdal/rooms/pilot-arco1/plaza-1920-base-v4.png?url';
import plazaCastleOpenUrl from '../../assets/ohmdal/rooms/pilot-arco1/plaza-castillo-abierto-v4.png?url';
import puertaClosedUrl from '../../assets/ohmdal/rooms/pilot-arco1/puerta_base-v4.png?url';
import puertaOpenUrl from '../../assets/ohmdal/rooms/pilot-arco1/puerta_open-v4.png?url';
import manantialUrl from '../../assets/ohmdal/rooms/pilot-arco1/manantial_ohm_base-v4.png?url';
import tallerUrl from '../../assets/ohmdal/rooms/pilot-arco1/taller_base-v4.png?url';
import castleGateUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_gate_base-v4.png?url';
import castleGalleryUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_gallery_base-v4.png?url';
import castleBranchesUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_branches_base-v4.png?url';
import castleHeartUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_heart_base-v4.png?url';
import forgeYardUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_yard_base-v4.png?url';
import forgeInfirmaryUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_infirmary_base-v4.png?url';
import forgeLongchannelUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_longchannel_base-v4.png?url';
import forgeHallUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_hall_base-v4.png?url';
import forgeHearthOnUrl from '../../assets/ohmdal/rooms/pilot-arco1/prop_forge_hearth_on.png?url';
import terracesTopUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_top_base-v4.png?url';
import terracesMidUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_mid_base-v4.png?url';
import terracesMuralUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_mural_base-v4.png?url';
import terracesAqueductUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_aqueduct_base-v4.png?url';
import lighthouseHallUrl from '../../assets/ohmdal/rooms/pilot-arco1/lighthouse_hall_base-v4.png?url';
import lighthouseBenchUrl from '../../assets/ohmdal/rooms/pilot-arco1/lighthouse_bench_base-v4.png?url';
import clockTowerUrl from '../../assets/ohmdal/rooms/pilot-arco1/clock_tower_base-v4.png?url';
import lighthouseLanternUrl from '../../assets/ohmdal/rooms/pilot-arco1/lighthouse_lantern_base-v4.png?url';
import lighthouseLensOnUrl from '../../assets/ohmdal/rooms/pilot-arco1/prop_lighthouse_lens_on_runtime-v2.png?url';
import lighthouseDockUrl from '../../assets/ohmdal/rooms/pilot-arco1/prop_lighthouse_dock_runtime.png?url';
import lighthouseBoatUrl from '../../assets/ohmdal/rooms/pilot-arco1/prop_lighthouse_boat_runtime.png?url';

export const ROOM_BACKGROUND_FILES: Record<string, string> = {
  'room-plaza': plazaUrl,
  'room-plaza-castle-open': plazaCastleOpenUrl,
  'room-puerta-closed': puertaClosedUrl,
  'room-puerta-open': puertaOpenUrl,
  'room-manantial': manantialUrl,
  'room-taller': tallerUrl,
  'room-castle-gate': castleGateUrl,
  'room-castle-gallery': castleGalleryUrl,
  'room-castle-branches': castleBranchesUrl,
  'room-castle-heart': castleHeartUrl,
  'room-forge-yard': forgeYardUrl,
  'room-forge-infirmary': forgeInfirmaryUrl,
  'room-forge-longchannel': forgeLongchannelUrl,
  'room-forge-hall': forgeHallUrl,
  'state-forge-hearth-on': forgeHearthOnUrl,
  'room-terraces-top': terracesTopUrl,
  'room-terraces-mid': terracesMidUrl,
  'room-terraces-mural': terracesMuralUrl,
  'room-terraces-aqueduct': terracesAqueductUrl,
  'room-lighthouse-hall': lighthouseHallUrl,
  'room-lighthouse-bench': lighthouseBenchUrl,
  'room-clock-tower': clockTowerUrl,
  'room-lighthouse-lantern': lighthouseLanternUrl,
  'state-lighthouse-lens-on': lighthouseLensOnUrl,
  'state-lighthouse-dock': lighthouseDockUrl,
  'state-lighthouse-boat': lighthouseBoatUrl,
};

// Datos de puesta en escena (walkable/collision/doors/entries/things/perspective):
// ver roomScenesData.ts. Separado para que Node pueda importarlo en tests sin
// pasar por el resolver de assets `?url` de Vite.
export * from './roomScenesData.ts';
