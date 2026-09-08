import { api, currentUser, getSession, type Session } from './serviceClient.ts';

const mounts = new WeakMap<HTMLElement, () => void>();
let mountSequence = 0;

/** Mount a real account surface inside a room. Discarded room views never receive async UI updates. */
export function renderAccount(container: HTMLElement): void {
  mounts.get(container)?.();
  const controller = new AbortController();
  const root = document.createElement('div');
  root.className = 'account-service';
  container.replaceChildren(root);
  const prefix = `account-${++mountSequence}`;
  let tab: 'login' | 'register' = 'login';
  let pending = true;
  let disposed = false;
  let announcement = '';
  let announcementError = false;
  const isMounted = () => !disposed && container.contains(root);
  const observer = new MutationObserver(() => {
    if (!root.isConnected) dispose();
  });
  function dispose(): void {
    disposed = true;
    controller.abort();
    observer.disconnect();
  }
  mounts.set(container, dispose);
  observer.observe(document.body, { childList: true, subtree: true });

  function message(text: string, error = false): void {
    announcement = text;
    announcementError = error;
    const status = root.querySelector<HTMLElement>('.form-status');
    if (status) {
      status.textContent = text;
      status.dataset.error = String(error);
    }
  }
  function setBusy(value: boolean): void {
    pending = value;
    root.setAttribute('aria-busy', String(value));
    root
      .querySelectorAll<HTMLButtonElement | HTMLInputElement>('button, input')
      .forEach((control) => {
        control.disabled = value;
      });
  }
  function statusElement(): HTMLElement {
    const status = document.createElement('p');
    status.className = 'form-status';
    status.id = `${prefix}-status`;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    status.dataset.error = String(announcementError);
    status.textContent = announcement;
    return status;
  }
  function field(
    form: HTMLFormElement,
    labelText: string,
    name: string,
    type: string,
    autocomplete: string,
    value = '',
  ): HTMLInputElement {
    const label = document.createElement('label');
    label.htmlFor = `${prefix}-${name}`;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.id = label.htmlFor;
    input.name = name;
    input.type = type;
    input.setAttribute('autocomplete', autocomplete);
    input.required = true;
    input.value = value;
    input.setAttribute('aria-describedby', `${prefix}-status`);
    if (type === 'password') {
      input.minLength = 10;
      input.maxLength = 128;
    }
    if (type === 'email') {
      input.maxLength = 254;
      input.spellcheck = false;
      input.autocapitalize = 'none';
    }
    if (name === 'name') {
      input.minLength = 2;
      input.maxLength = 60;
      input.setAttribute('autocomplete', 'nickname');
    }
    form.append(label, input);
    return input;
  }
  function button(
    text: string,
    className = 'button',
    type: 'button' | 'submit' = 'button',
  ): HTMLButtonElement {
    const element = document.createElement('button');
    element.type = type;
    element.className = className;
    element.textContent = text;
    return element;
  }
  function notice(text: string): HTMLElement {
    const p = document.createElement('p');
    p.className = 'notice';
    p.textContent = text;
    return p;
  }
  function form(name: string): HTMLFormElement {
    const element = document.createElement('form');
    element.className = 'form-stack';
    element.setAttribute('aria-label', name);
    return element;
  }

  async function submit(
    work: () => Promise<unknown>,
    success: string,
    clearPasswords = false,
  ): Promise<void> {
    if (pending) return;
    const userAtStart = currentUser()?.id ?? null;
    message('Guardando…');
    setBusy(true);
    try {
      await work();
      if (!isMounted()) return;
      pending = false;
      announcement = success;
      announcementError = false;
      render();
      root
        .querySelector<HTMLElement>('.form-status')
        ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } catch (error) {
      if (!isMounted()) return;
      setBusy(false);
      if (clearPasswords)
        root
          .querySelectorAll<HTMLInputElement>('input[type=password]')
          .forEach((input) => {
            input.value = '';
          });
      message(
        error instanceof Error
          ? error.message
          : 'No pudimos completar la acción. Volvé a intentar.',
        true,
      );
      if (userAtStart !== (currentUser()?.id ?? null)) render();
    }
  }

  function render(): void {
    if (!isMounted()) return;
    root.replaceChildren();
    root.setAttribute('aria-busy', 'false');
    const user = currentUser();
    if (!user) {
      const tabs = document.createElement('div');
      tabs.className = 'room-tabs';
      tabs.setAttribute('role', 'group');
      tabs.setAttribute('aria-label', 'Acceso al Instituto');
      for (const [id, label] of [
        ['login', 'Ingresar'],
        ['register', 'Crear cuenta'],
      ] as const) {
        const choice = button(label, tab === id ? 'is-active' : '');
        choice.setAttribute('aria-pressed', String(tab === id));
        choice.addEventListener('click', () => {
          if (!pending) {
            tab = id;
            announcement = '';
            render();
            root.querySelector<HTMLInputElement>('input')?.focus();
          }
        });
        tabs.append(choice);
      }
      root.append(
        tabs,
        notice(
          tab === 'register'
            ? 'Una cuenta conserva tus lecturas, marcadores y logros del Instituto. Podés jugar sin registrarte.'
            : 'Volvé a tu biblioteca y a lo que descubriste en el Instituto.',
        ),
      );
      const access = form(tab === 'register' ? 'Crear cuenta' : 'Ingresar');
      const name =
        tab === 'register'
          ? field(access, 'Tu nombre', 'name', 'text', 'nickname')
          : null;
      const email = field(
        access,
        'Correo electrónico',
        'email',
        'email',
        'username',
      );
      const password = field(
        access,
        tab === 'register' ? 'Contraseña · mínimo 10 caracteres' : 'Contraseña',
        'password',
        'password',
        tab === 'register' ? 'new-password' : 'current-password',
      );
      if (tab === 'register') {
        const consent = document.createElement('label');
        consent.className = 'check-label';
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.name = 'privacy';
        check.required = true;
        const wording = document.createElement('span');
        wording.textContent = 'Leí cómo se usan y guardan mis datos.';
        consent.append(check, wording);
        const privacy = button('Leer la política de privacidad', 'text-button');
        privacy.dataset.openDialog = 'privacy-dialog';
        access.append(consent, privacy);
      }
      access.append(
        button(
          tab === 'register' ? 'Crear mi cuenta' : 'Ingresar',
          'button',
          'submit',
        ),
      );
      access.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!access.reportValidity()) return;
        const body = {
          email: email.value,
          password: password.value,
          ...(name ? { name: name.value } : {}),
        };
        void submit(
          () =>
            api<Session>(
              `/api/auth/${tab === 'register' ? 'register' : 'login'}`,
              'POST',
              body,
            ),
          tab === 'register'
            ? 'Tu cuenta está creada. Bienvenido al Instituto.'
            : 'Sesión iniciada. Tu recorrido te espera.',
          true,
        );
      });
      root.append(
        access,
        statusElement(),
        notice(
          'El correo identifica tu cuenta; no enviamos un mensaje de verificación. Por ahora no hay recuperación de contraseña.',
        ),
      );
    } else {
      const card = document.createElement('div');
      card.className = 'account-card';
      const avatar = document.createElement('span');
      avatar.className = 'avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent =
        Array.from(user.name.trim())[0]?.toUpperCase() ?? 'R';
      const identity = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = user.name;
      const email = document.createElement('p');
      email.textContent = user.email;
      identity.append(title, email);
      card.append(avatar, identity);
      root.append(card);
      const profile = form('Editar mi perfil');
      const name = field(
        profile,
        'Tu nombre en el Instituto',
        'name',
        'text',
        'nickname',
        user.name,
      );
      profile.append(button('Guardar nombre', 'button secondary', 'submit'));
      profile.addEventListener('submit', (event) => {
        event.preventDefault();
        if (profile.reportValidity())
          void submit(
            () => api('/api/profile', 'PATCH', { name: name.value }),
            'Nombre actualizado.',
          );
      });
      root.append(profile);
      const disclosure = document.createElement('details');
      disclosure.className = 'detail-disclosure';
      const summary = document.createElement('summary');
      summary.textContent = 'Cambiar contraseña';
      disclosure.append(summary);
      const passwords = form('Cambiar contraseña');
      const current = field(
        passwords,
        'Contraseña actual',
        'current-password',
        'password',
        'current-password',
      );
      const next = field(
        passwords,
        'Nueva contraseña · mínimo 10 caracteres',
        'new-password',
        'password',
        'new-password',
      );
      const confirmation = field(
        passwords,
        'Repetir nueva contraseña',
        'confirm-password',
        'password',
        'new-password',
      );
      confirmation.addEventListener('input', () =>
        confirmation.setCustomValidity(''),
      );
      next.addEventListener('input', () => confirmation.setCustomValidity(''));
      passwords.append(
        button('Actualizar contraseña', 'button secondary', 'submit'),
      );
      passwords.addEventListener('submit', (event) => {
        event.preventDefault();
        confirmation.setCustomValidity(
          next.value === confirmation.value
            ? ''
            : 'Las contraseñas nuevas deben coincidir.',
        );
        if (passwords.reportValidity())
          void submit(
            () =>
              api<Session>('/api/auth/password', 'POST', {
                currentPassword: current.value,
                newPassword: next.value,
              }),
            'Contraseña actualizada. Las otras sesiones se cerraron.',
            true,
          );
      });
      disclosure.append(
        passwords,
        notice(
          'Necesitás la contraseña actual. Al cambiarla, se cierran las sesiones abiertas en otros dispositivos.',
        ),
      );
      root.append(disclosure, statusElement());
      const logout = button('Cerrar sesión', 'text-button');
      logout.addEventListener('click', () => {
        tab = 'login';
        void submit(
          () => api<Session>('/api/auth/logout', 'POST', {}),
          'Sesión cerrada. Podés seguir explorando.',
        );
      });
      root.append(logout);
      root.append(
        notice(
          'Tu biblioteca se guarda en esta cuenta. Las partidas de los juegos conservan sus propios guardados.',
        ),
      );
    }
  }
  window.addEventListener(
    'roxana:session',
    () => {
      if (!isMounted()) {
        dispose();
        return;
      }
      if (!pending) render();
    },
    { signal: controller.signal },
  );
  root.append(notice('Abriendo tu cuenta…'));
  root.setAttribute('aria-busy', 'true');
  void getSession()
    .then(() => {
      if (isMounted()) {
        pending = false;
        render();
      }
    })
    .catch((error) => {
      if (!isMounted()) return;
      pending = false;
      announcement =
        error instanceof Error
          ? error.message
          : 'No pudimos abrir el servicio de cuentas.';
      announcementError = true;
      render();
    });
}
