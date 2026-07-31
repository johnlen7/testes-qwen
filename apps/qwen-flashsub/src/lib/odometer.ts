import { prefersReducedMotion } from "./motion";

const DIGITS = "0123456789".split("");

const ODO_CSS = /* css */ `
.odo__col {
  display: inline-block;
  overflow: hidden;
  height: 1em;
  vertical-align: top;
}
.odo__strip {
  display: block;
  line-height: 1;
  transition: transform var(--dur-3) var(--ease-out);
}
.odo__static {
  display: inline-block;
  vertical-align: top;
  line-height: 1;
}
`;

export interface Odometer {
  set(value: number): void;
}

function injectStyles(): void {
  if (document.getElementById("odo-styles")) return;
  const style = document.createElement("style");
  style.id = "odo-styles";
  style.textContent = ODO_CSS;
  document.head.appendChild(style);
}

function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

export function createOdometer(el: HTMLElement): Odometer {
  injectStyles();

  let strips: HTMLElement[] = [];
  let ready = false;

  function build(formatted: string): void {
    el.replaceChildren();
    strips = [];
    for (const ch of formatted) {
      if (ch >= "0" && ch <= "9") {
        const col = document.createElement("span");
        col.className = "odo__col";
        const strip = document.createElement("span");
        strip.className = "odo__strip";
        strip.innerHTML = DIGITS.join("<br>");
        col.appendChild(strip);
        el.appendChild(col);
        strips.push(strip);
      } else {
        const staticSpan = document.createElement("span");
        staticSpan.className = "odo__static";
        staticSpan.textContent = ch;
        el.appendChild(staticSpan);
      }
    }
  }

  function set(value: number): void {
    const formatted = formatPrice(value);
    const digitCount = formatted.replace(/\D/g, "").length;
    if (digitCount !== strips.length) {
      build(formatted);
      ready = false;
    }

    const animate = ready && !prefersReducedMotion();
    let i = 0;
    for (const ch of formatted) {
      if (ch < "0" || ch > "9") continue;
      const strip = strips[i++];
      const d = Number(ch);
      strip.style.transition = animate ? "" : "none";
      strip.style.transform = `translateY(${-d}em)`;
    }

    if (!animate) {
      void el.offsetWidth;
      for (const strip of strips) strip.style.transition = "";
    }
    ready = true;
  }

  build(formatPrice(0));
  return { set };
}
