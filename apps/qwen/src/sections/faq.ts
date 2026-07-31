/**
 * 4.6 FAQ — accordion autoral.
 * Altura animada via grid-template-rows 0fr → 1fr (interpolável, sem medir
 * height em JS, sem height:auto quebrado). Padrão WAI-ARIA completo:
 * Enter/Space alterna; ↑↓ Home/End navegam entre headers.
 */

export function initFaq(): void {
  const items = [...document.querySelectorAll<HTMLElement>('.acc-item')]
  const triggers = items.map((item) => item.querySelector<HTMLButtonElement>('.acc-trigger')!)

  const setOpen = (item: HTMLElement, open: boolean) => {
    item.classList.toggle('is-open', open)
    item.querySelector('.acc-trigger')?.setAttribute('aria-expanded', String(open))
  }

  triggers.forEach((trigger, i) => {
    const item = items[i]

    trigger.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open')
      // fecha os demais — acordeão clássico, um só aberto
      items.forEach((other) => setOpen(other, other === item ? willOpen : false))
    })

    trigger.addEventListener('keydown', (e) => {
      let next = -1
      if (e.key === 'ArrowDown') next = (i + 1) % triggers.length
      else if (e.key === 'ArrowUp') next = (i - 1 + triggers.length) % triggers.length
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = triggers.length - 1
      if (next >= 0) {
        e.preventDefault()
        triggers[next].focus()
      }
    })
  })
}
