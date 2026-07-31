/* ============================================================
   toast — notificação de pré-pedido
   ============================================================ */

let timer: number | undefined;

export function showToast(msg: string) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toast-msg');
  if (!toast || !text) return;
  text.textContent = msg;
  toast.setAttribute('aria-hidden', 'false');
  toast.classList.add('is-in');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    toast.classList.remove('is-in');
    toast.setAttribute('aria-hidden', 'true');
  }, 2800);
}
