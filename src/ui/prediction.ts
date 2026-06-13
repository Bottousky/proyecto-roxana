export interface PredictionPageOptions {
  prompt: string;
  unit?: string;
  expectedLabel?: string;
  measuredLabel?: string;
  exactStamp?: string;
  compare?: (predicted: number, measured: number) => boolean;
  onPrediction?: (predicted: number, measured?: number) => void;
}

export interface PredictionPageHandle {
  element: HTMLElement;
  input: HTMLInputElement;
  hasPrediction(): boolean;
  getPrediction(): number | undefined;
  setMeasured(value: number): void;
  clearMeasured(): void;
  getMeasured(): number | undefined;
  isExact(): boolean;
  focus(): void;
}

export function createPredictionPage(
  options: PredictionPageOptions,
): PredictionPageHandle {
  const unit = options.unit ?? '';
  const compare = options.compare ?? ((predicted, measured) => predicted === measured);
  let predicted: number | undefined;
  let measured: number | undefined;

  const element = document.createElement('section');
  element.className = 'prediction-page';
  element.innerHTML = `
    <div class="prediction-page-heading">
      <span>Bitácora · página de predicción</span>
      <strong>${options.prompt}</strong>
    </div>
    <div class="prediction-page-form">
      <label>
        <span>Mi predicción</span>
        <input class="prediction-input" type="number" inputmode="decimal" step="any" />
      </label>
      <button class="prediction-submit" type="button">Cargar predicción</button>
    </div>
    <div class="prediction-comparison hidden" aria-live="polite">
      <div>
        <span>${options.expectedLabel ?? 'Lo esperado'}</span>
        <strong data-prediction-value>—</strong>
      </div>
      <div>
        <span>${options.measuredLabel ?? 'Lo medido'}</span>
        <strong data-measured-value>—</strong>
      </div>
    </div>
    <div class="prediction-stamp hidden">${options.exactStamp ?? 'PREDICHO Y MEDIDO: IGUALES'}</div>
    <div class="prediction-error hidden" role="alert">Escriba un número antes de continuar.</div>`;

  const input = element.querySelector<HTMLInputElement>('.prediction-input')!;
  const submit = element.querySelector<HTMLButtonElement>('.prediction-submit')!;
  const comparison = element.querySelector<HTMLElement>('.prediction-comparison')!;
  const stamp = element.querySelector<HTMLElement>('.prediction-stamp')!;
  const error = element.querySelector<HTMLElement>('.prediction-error')!;
  const predictedValue = element.querySelector<HTMLElement>('[data-prediction-value]')!;
  const measuredValue = element.querySelector<HTMLElement>('[data-measured-value]')!;

  function submitPrediction(): void {
    const value = input.valueAsNumber;
    if (!Number.isFinite(value)) {
      error.classList.remove('hidden');
      return;
    }

    predicted = value;
    error.classList.add('hidden');
    render();
    options.onPrediction?.(value, measured);
  }

  function render(): void {
    predictedValue.textContent =
      predicted === undefined ? '—' : formatMeasurement(predicted, unit);
    measuredValue.textContent =
      measured === undefined ? '—' : formatMeasurement(measured, unit);
    comparison.classList.toggle('hidden', measured === undefined);
    stamp.classList.toggle('hidden', !isExact());
    element.classList.toggle('exact', isExact());
  }

  function isExact(): boolean {
    return (
      predicted !== undefined &&
      measured !== undefined &&
      compare(predicted, measured)
    );
  }

  submit.addEventListener('click', submitPrediction);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitPrediction();
  });
  input.addEventListener('input', () => error.classList.add('hidden'));

  return {
    element,
    input,
    hasPrediction: () => predicted !== undefined,
    getPrediction: () => predicted,
    setMeasured(value: number) {
      measured = value;
      render();
    },
    clearMeasured() {
      measured = undefined;
      render();
    },
    getMeasured: () => measured,
    isExact,
    focus: () => input.focus(),
  };
}

function formatMeasurement(value: number, unit: string): string {
  const formatted = Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return unit ? `${formatted} ${unit}` : formatted;
}
