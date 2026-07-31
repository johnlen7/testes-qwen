/** FAQ · accordion acessível (grid-rows anima a altura) + navegação por setas. */

export function initFaq(): void {
  const list = document.querySelector<HTMLElement>("[data-faq]");
  if (!list) return;

  const items = Array.from(list.querySelectorAll<HTMLElement>(".faq-item"));
  const triggers = items.map((item) =>
    item.querySelector<HTMLButtonElement>(".faq-trigger")
  );

  const setOpen = (item: HTMLElement, open: boolean) => {
    item.classList.toggle("is-open", open);
    const trigger = item.querySelector<HTMLButtonElement>(".faq-trigger");
    trigger?.setAttribute("aria-expanded", String(open));
  };

  items.forEach((item, i) => {
    const trigger = triggers[i];
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      // single-open: fecha os demais
      items.forEach((other) => setOpen(other, false));
      setOpen(item, willOpen);
    });

    trigger.addEventListener("keydown", (e) => {
      const last = triggers.length - 1;
      let target = -1;
      switch (e.key) {
        case "ArrowDown":
          target = i === last ? 0 : i + 1;
          break;
        case "ArrowUp":
          target = i === 0 ? last : i - 1;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = last;
          break;
        default:
          return;
      }
      e.preventDefault();
      triggers[target]?.focus();
    });
  });
}
