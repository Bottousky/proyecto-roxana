import { readSchoolState } from './schoolModel.ts';
import {
  VOXEL_ROOMS,
  voxelStateLabel,
  voxelZoneState,
  type VoxelRoom,
  type VoxelZoneId,
} from './voxelSchoolModel.ts';
import { VoxelSchoolRenderer } from './voxelSchoolRenderer.ts';

export function initVoxelSchool(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#voxel-school-canvas');
  const title = document.querySelector<HTMLElement>('#voxel-zone-title');
  const eyebrow = document.querySelector<HTMLElement>('#voxel-zone-eyebrow');
  const description = document.querySelector<HTMLElement>('#voxel-zone-description');
  const status = document.querySelector<HTMLElement>('#voxel-zone-status');
  const action = document.querySelector<HTMLAnchorElement>('#voxel-zone-action');
  const zoneList = document.querySelector<HTMLElement>('#voxel-zone-list');
  if (!canvas || !title || !eyebrow || !description || !status || !action || !zoneList) return;

  const school = readSchoolState();
  let renderer: VoxelSchoolRenderer;

  const renderDetails = (room: VoxelRoom): void => {
    const roomState = voxelZoneState(room.id, school);
    eyebrow.textContent = room.eyebrow;
    title.textContent = room.title;
    description.textContent = room.description;
    status.textContent = voxelStateLabel(roomState);
    status.dataset.state = roomState;
    if (room.href && room.actionLabel) {
      action.href = room.href;
      action.textContent = room.actionLabel;
      action.hidden = false;
    } else {
      action.hidden = true;
    }
    zoneList.querySelectorAll<HTMLButtonElement>('button[data-zone]').forEach((button) => {
      const selected = button.dataset.zone === room.id;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };

  for (const room of VOXEL_ROOMS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.zone = room.id;
    button.textContent = room.shortTitle;
    button.setAttribute('aria-label', `Ver ${room.title}`);
    button.addEventListener('click', () => {
      renderer.select(room.id as VoxelZoneId);
      renderDetails(room);
    });
    zoneList.append(button);
  }

  renderer = new VoxelSchoolRenderer(canvas, renderDetails);
  renderDetails(VOXEL_ROOMS.find((room) => room.id === 'hall')!);
}
