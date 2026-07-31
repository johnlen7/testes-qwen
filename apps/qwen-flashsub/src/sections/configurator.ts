import {
  store,
  totalPrice,
  COLORWAYS,
  type ColorwayId,
  type SizeId,
} from "../lib/store";
import { createOdometer } from "../lib/odometer";
import { renderHeadphone } from "../components/headphone";

let initialized = false;

export function initConfigurator(): void {
  if (initialized) return;

  const headphoneEl = document.getElementById("config-headphone");
  const priceEl = document.getElementById("config-price");
  const finishLabel = document.getElementById("config-finish-label");
  const ctaEl = document.getElementById("config-cta");
  if (!headphoneEl || !priceEl || !finishLabel || !ctaEl) return;

  const colorwayInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="colorway"]')
  );
  const sizeInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="size"]')
  );

  initialized = true;

  const hp = renderHeadphone(headphoneEl, {
    colorway: "grafite",
    size: "padrao",
  });
  const odometer = createOdometer(priceEl);

  for (const input of colorwayInputs) {
    input.addEventListener("change", () => {
      store.setState({ colorway: input.value as ColorwayId });
    });
  }

  for (const input of sizeInputs) {
    input.addEventListener("change", () => {
      store.setState({ size: input.value as SizeId });
    });
  }

  const render = (): void => {
    const state = store.getState();
    hp.setColorway(state.colorway);
    hp.setSize(state.size);
    odometer.set(totalPrice(state));
    finishLabel.textContent = `${COLORWAYS[state.colorway].label} · alumínio escovado`;
    ctaEl.textContent = `Comprar ÓRBITA — ${COLORWAYS[state.colorway].label} · R$ ${totalPrice(
      state
    ).toLocaleString("pt-BR")}`;
  };

  store.subscribe(render);

  // inicializa com estado default (grafite, padrao)
  store.setState({ colorway: "grafite", size: "padrao" });
}
