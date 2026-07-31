import { createAccordion } from "../components/accordion";

let initialized = false;

export function initFaq(): void {
  if (initialized) return;

  const list = document.querySelector<HTMLElement>(".faq__list");
  if (!list) return;

  initialized = true;

  createAccordion(list);
}
