import { store, totalPrice, COLORWAYS, SIZES } from "../lib/store";
import { renderHeadphone } from "../components/headphone";
import { createMagneticButton } from "../components/magnetic";

let initialized = false;

export function initFinale(): void {
  if (initialized) return;

  const headphoneEl = document.getElementById("finale-headphone");
  const priceEl = document.getElementById("finale-price");
  const summaryEl = document.getElementById("finale-summary");
  const ctaEl = document.getElementById("finale-cta");
  if (!headphoneEl || !priceEl || !summaryEl || !ctaEl) return;

  initialized = true;

  const hp = renderHeadphone(headphoneEl);
  createMagneticButton(ctaEl);

  const render = (): void => {
    const state = store.getState();
    hp.setColorway(state.colorway);
    hp.setSize(state.size);
    priceEl.textContent = `R$ ${totalPrice(state).toLocaleString("pt-BR")}`;
    summaryEl.textContent = `${COLORWAYS[state.colorway].label}, concha ${SIZES[
      state.size
    ].label.toLowerCase()}`;
    ctaEl.textContent = `Comprar ÓRBITA — ${COLORWAYS[state.colorway].label} · R$ ${totalPrice(
      state
    ).toLocaleString("pt-BR")}`;
  };

  store.subscribe(render);

  // inicializa com estado atual do store
  render();
}
