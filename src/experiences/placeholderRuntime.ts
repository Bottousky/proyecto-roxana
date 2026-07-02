// Runtime DOM mínimo para mundos `planned`: todavía no tienen motor propio,
// pero ya participan del shell de experiencias.
import { activateExperience, experienceById } from './registry.ts';
import type { ExperienceId, ExperienceRuntime, ExperienceRuntimeModule, RuntimeHandle } from './types.ts';

export function placeholderRuntime(
  runtime: ExperienceRuntime,
  experienceId: ExperienceId,
): ExperienceRuntimeModule {
  return {
    runtime,
    async mount(hostEl, context) {
      const experience = experienceById(experienceId);
      activateExperience(experience, null);

      const root = document.createElement('div');
      root.className = 'runtime-placeholder';

      const title = document.createElement('h1');
      title.textContent = experience.title;

      const fantasy = document.createElement('p');
      fantasy.className = 'fantasy';
      fantasy.textContent = experience.fantasy;

      const notice = document.createElement('p');
      notice.textContent = 'Este mundo todavía está en construcción.';

      const back = document.createElement('button');
      back.textContent = 'Volver al Instituto';
      back.addEventListener('click', () => {
        void context.requestTravel({ experienceId: 'instituto' });
      });

      root.append(title, fantasy, notice, back);
      hostEl.appendChild(root);

      const handle: RuntimeHandle = {
        async travelTo() {
          // Runtime sin salas internas: no hay a dónde viajar sin cruzar de experiencia.
        },
        snapshot() {
          return { runtime, data: {} };
        },
        pause() {},
        resume() {},
        async destroy() {
          root.remove();
        },
      };

      return handle;
    },
  };
}
