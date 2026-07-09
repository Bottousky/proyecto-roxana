import plazaUrl from '../../assets/ohmdal/rooms/plaza.png?url';
import puertaClosedUrl from '../../assets/ohmdal/rooms/puerta_de_ohm+prop_de_puerta.png?url';
import puertaOpenUrl from '../../assets/ohmdal/rooms/puerta_de_ohm+prop_abierta.png?url';
import manantialUrl from '../../assets/ohmdal/rooms/pilot-arco1/manantial_ohm+prop_boca_manantial-v2.png?url';
import tallerUrl from '../../assets/ohmdal/rooms/pilot-arco1/taller_base.png?url';
import castleGateUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_gate+prop_porton_castillo-v2.png?url';
import castleGalleryUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_gallery_base.png?url';
import castleBranchesUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_branches+prop_castle_trunk_distributor.png?url';
import castleHeartUrl from '../../assets/ohmdal/rooms/pilot-arco1/castle_heart+prop_castle_master_distributor.png?url';
import forgeYardUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_yard+prop_forge_gate.png?url';
import forgeInfirmaryUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_infirmary_base.png?url';
import forgeLongchannelUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_longchannel_base.png?url';
import forgeHallUrl from '../../assets/ohmdal/rooms/pilot-arco1/forge_hall+prop_forge_hearth_off.png?url';
import terracesTopUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_top_base.png?url';
import terracesMidUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_mid_base.png?url';
import terracesMuralUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_mural_base.png?url';
import terracesAqueductUrl from '../../assets/ohmdal/rooms/pilot-arco1/terraces_aqueduct_base.png?url';
import lighthouseHallUrl from '../../assets/ohmdal/rooms/pilot-arco1/lighthouse_hall_base.png?url';
import lighthouseBenchUrl from '../../assets/ohmdal/rooms/pilot-arco1/lighthouse_bench_base.png?url';
import clockTowerUrl from '../../assets/ohmdal/rooms/pilot-arco1/clock_tower+prop_clock_face.png?url';
import lighthouseLanternUrl from '../../assets/ohmdal/rooms/pilot-arco1/lighthouse_lantern+prop_lighthouse_lens_off.png?url';

export const ROOM_BACKGROUND_FILES: Record<string, string> = {
  'room-plaza': plazaUrl,
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
  'room-terraces-top': terracesTopUrl,
  'room-terraces-mid': terracesMidUrl,
  'room-terraces-mural': terracesMuralUrl,
  'room-terraces-aqueduct': terracesAqueductUrl,
  'room-lighthouse-hall': lighthouseHallUrl,
  'room-lighthouse-bench': lighthouseBenchUrl,
  'room-clock-tower': clockTowerUrl,
  'room-lighthouse-lantern': lighthouseLanternUrl,
};

// Datos de puesta en escena (walkable/collision/doors/entries/things/perspective):
// ver roomScenesData.ts. Separado para que Node pueda importarlo en tests sin
// pasar por el resolver de assets `?url` de Vite.
export * from './roomScenesData.ts';
