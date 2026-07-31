/**
 * 4.3 Configurador interativo + store compartilhado do produto.
 * - 4 acabamentos → CSS vars globais (--hp-*) → repaint animado do SVG.
 * - Modo de escuta (atributo 2) → ondas EQ no fone + delta de preço.
 * - Preço em dígito-rolô (colunas 0–9 transladando), não contador simples.
 * - Estado consumido pelo CTA final (seção 4.7) via productStore.subscribe.
 */
import { createStore } from '../lib/store'
import { prefersReducedMotion } from '../lib/media'

/* ── Catálogo ── */

export interface Finish {
  name: string
  shell: string
  hi: string
  cushion: string
  ring: string
  delta: number
}

export interface SoundMode {
  name: string
  delta: number
}

export const FINISHES: Record<string, Finish> = {
  grafite: { name: 'Grafite', shell: '#2a2d34', hi: '#4a4e58', cushion: '#17181c', ring: '#ff5c1a', delta: 0 },
  areia: { name: 'Areia Lunar', shell: '#d8cfc0', hi: '#efe8db', cushion: '#8f8677', ring: '#d9420a', delta: 0 },
  abissal: { name: 'Azul Abissal', shell: '#1d3a5f', hi: '#2f5484', cushion: '#0f1e33', ring: '#57e6c0', delta: 100 },
  flare: { name: 'Flare Solar', shell: '#ff5c1a', hi: '#ff8a5c', cushion: '#3a1408', ring: '#15171d', delta: 200 },
}

export const MODES: Record<string, SoundMode> = {
  estudio: { name: 'Estúdio', delta: 0 },
  imersivo: { name: 'Imersivo', delta: 300 },
}

export const BASE_PRICE = 2499

export interface ProductState {
  color: string
  mode: string
}

export const productStore = createStore<ProductState>({
  color: 'grafite',
  mode: 'estudio',
})

export const priceOf = (s: ProductState): number =>
  BASE_PRICE + FINISHES[s.color].delta + MODES[s.mode].delta

export const formatBRL = (v: number): string => v.toLocaleString('pt-BR')

/* ── Dígito-rolô ── */

class DigitRoll {
  private cols: { el: HTMLElement; strip: HTMLElement; char: string }[] = []

  constructor(private root: HTMLElement) {}

  render(value: string): void {
    const sameShape =
      value.length === this.cols.length &&
      [...value].every((ch, i) => (/\d/.test(ch) ? /\d/.test(this.cols[i].char) : ch === this.cols[i].char))

    if (!sameShape) {
      this.root.innerHTML = ''
      this.cols = [...value].map((ch) => {
        if (/\d/.test(ch)) {
          const el = document.createElement('span')
          el.className = 'digit'
          const strip = document.createElement('span')
          strip.className = 'digit-strip'
          strip.innerHTML = '0123456789'.split('').map((d) => `<span>${d}</span>`).join('')
          el.appendChild(strip)
          this.root.appendChild(el)
          return { el, strip, char: ch }
        }
        const el = document.createElement('span')
        el.className = 'digit-sep'
        el.textContent = ch
        this.root.appendChild(el)
        return { el, strip: el, char: ch }
      })
    }

    ;[...value].forEach((ch, i) => {
      const col = this.cols[i]
      if (/\d/.test(ch)) {
        col.strip.style.transform = `translateY(-${Number(ch) * 10}%)`
      }
      col.char = ch
    })
  }
}

/* ── Radiogroup acessível (setas) ── */

function rovingRadioGroup(container: HTMLElement, onPick: (btn: HTMLElement) => void): void {
  const buttons = [...container.querySelectorAll<HTMLElement>('[role="radio"]')]

  const select = (btn: HTMLElement) => {
    buttons.forEach((b) => {
      const selected = b === btn
      b.classList.toggle('is-selected', selected)
      b.setAttribute('aria-checked', String(selected))
      b.tabIndex = selected ? 0 : -1
    })
    btn.focus()
    onPick(btn)
  }

  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[role="radio"]')
    if (btn && container.contains(btn)) select(btn)
  })

  container.addEventListener('keydown', (e) => {
    const idx = buttons.indexOf(document.activeElement as HTMLElement)
    if (idx === -1) return
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % buttons.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + buttons.length) % buttons.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = buttons.length - 1
    if (next >= 0) {
      e.preventDefault()
      select(buttons[next])
    }
  })

  // estado inicial: selecionado focável, demais não
  buttons.forEach((b) => {
    b.tabIndex = b.classList.contains('is-selected') ? 0 : -1
  })
}

/* ── Inicialização ── */

export function initConfigurator(): void {
  const section = document.querySelector<HTMLElement>('.configurator')
  if (!section) return

  const roll = new DigitRoll(section.querySelector<HTMLElement>('[data-price]')!)
  const swatchName = section.querySelector<HTMLElement>('.config-swatch-name')
  const configVisual = section.querySelector<HTMLElement>('.config-visual')
  const hpMount = section.querySelector<HTMLElement>('[data-headphone="config"]')

  const applyFinish = (colorKey: string) => {
    const f = FINISHES[colorKey]
    const root = document.documentElement
    root.style.setProperty('--hp-shell', f.shell)
    root.style.setProperty('--hp-shell-hi', f.hi)
    root.style.setProperty('--hp-cushion', f.cushion)
    root.style.setProperty('--hp-ring', f.ring)

    if (swatchName && swatchName.textContent !== f.name) {
      swatchName.textContent = f.name
      if (!prefersReducedMotion()) {
        swatchName.animate(
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        )
      }
    }

    // pulso spring no fone a cada troca de cor
    if (hpMount && !prefersReducedMotion()) {
      hpMount.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
        { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      )
    }
  }

  const renderPrice = (s: ProductState) => {
    roll.render(formatBRL(priceOf(s)))
  }

  const renderCta = (s: ProductState) => {
    const cta = section.querySelector<HTMLElement>('[data-cta]')
    if (cta) cta.textContent = `Comprar ÓRBITA — ${FINISHES[s.color].name}`
  }

  productStore.subscribe((s) => {
    applyFinish(s.color)
    renderPrice(s)
    renderCta(s)
    if (configVisual) configVisual.dataset.mode = s.mode
  })

  rovingRadioGroup(section.querySelector('.swatches')!, (btn) => {
    productStore.set({ color: btn.dataset.color! })
  })

  rovingRadioGroup(section.querySelector('.modes')!, (btn) => {
    productStore.set({ mode: btn.dataset.mode! })
  })

  // simulação de checkout — feedback no próprio botão
  section.querySelector<HTMLElement>('[data-cta]')?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLElement
    const s = productStore.get()
    const original = `Comprar ÓRBITA — ${FINISHES[s.color].name}`
    btn.textContent = `ÓRBITA ${FINISHES[s.color].name} · adicionado ✓`
    btn.setAttribute('disabled', '')
    setTimeout(() => {
      btn.textContent = original
      btn.removeAttribute('disabled')
    }, 2200)
  })
}

/* ── CTA final (4.7) consome o mesmo store ── */

export function initFinaleBinding(): void {
  const bind = <T extends HTMLElement>(sel: string, fn: (el: T, s: ProductState) => void) => {
    const el = document.querySelector<T>(sel)
    if (el) productStore.subscribe((s) => fn(el, s))
  }

  bind('[data-finale-color]', (el, s) => {
    el.textContent = FINISHES[s.color].name
  })
  bind('[data-finale-mode]', (el, s) => {
    el.textContent = MODES[s.mode].name
  })
  bind('[data-finale-price]', (el, s) => {
    el.textContent = `R$ ${formatBRL(priceOf(s))}`
  })
  bind('[data-finale-cta] .btn-magnetic-label', (el, s) => {
    el.textContent = `Comprar ÓRBITA — ${FINISHES[s.color].name} · R$ ${formatBRL(priceOf(s))}`
  })

  const finaleVisual = document.querySelector<HTMLElement>('[data-headphone="finale"]')
  if (finaleVisual) finaleVisual.dataset.binded = 'true' // marca p/ CSS (anel de glow)
}
