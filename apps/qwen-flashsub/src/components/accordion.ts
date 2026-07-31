export interface Accordion {
  destroy(): void;
}

export function createAccordion(container: HTMLElement): Accordion {
  const triggers = Array.from(
    container.querySelectorAll<HTMLButtonElement>(".faq__trigger")
  );
  if (triggers.length === 0) return { destroy() {} };

  function setOpen(trigger: HTMLButtonElement, open: boolean) {
    const item = trigger.closest<HTMLElement>(".faq__item");
    if (!item) return;
    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
  }

  function closeOthers(except: HTMLButtonElement) {
    for (const t of triggers) {
      if (t !== except && t.getAttribute("aria-expanded") === "true") {
        setOpen(t, false);
      }
    }
  }

  const onClick = (e: MouseEvent) => {
    const trigger = e.currentTarget as HTMLButtonElement;
    const willOpen = trigger.getAttribute("aria-expanded") !== "true";
    closeOthers(trigger);
    setOpen(trigger, willOpen);
  };

  const onKeydown = (e: KeyboardEvent) => {
    const trigger = e.currentTarget as HTMLButtonElement;
    const idx = triggers.indexOf(trigger);
    if (idx === -1) return;
    let next: HTMLButtonElement | null = null;
    switch (e.key) {
      case "ArrowDown":
        next = triggers[(idx + 1) % triggers.length];
        break;
      case "ArrowUp":
        next = triggers[(idx - 1 + triggers.length) % triggers.length];
        break;
      case "Home":
        next = triggers[0];
        break;
      case "End":
        next = triggers[triggers.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    next.focus();
  };

  for (const t of triggers) {
    t.addEventListener("click", onClick);
    t.addEventListener("keydown", onKeydown);
  }

  return {
    destroy() {
      for (const t of triggers) {
        t.removeEventListener("click", onClick);
        t.removeEventListener("keydown", onKeydown);
      }
    },
  };
}
