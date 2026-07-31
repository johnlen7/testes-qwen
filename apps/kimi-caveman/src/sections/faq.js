import './faq.css';
import { reducedMotion } from '../lib/motion.js';
import { observeReveal } from '../lib/reveal.js';

const FAQS = [
  {
    q: 'Qual o prazo de entrega do ÓRBITA?',
    a: 'O ÓRBITA é enviado em até 2 dias úteis após a confirmação do pagamento. Para capitais, o prazo médio é de 3 a 5 dias úteis; para outras localidades, de 5 a 10 dias úteis. Você recebe o código de rastreio por e-mail assim que o pedido sair do nosso centro de distribuição.'
  },
  {
    q: 'A garantia cobre o que, exatamente?',
    a: 'Todos os fones ÓRBITA têm garantia legal de 2 anos contra defeitos de fabricação. Isso inclui falhas no driver, no sistema de cancelamento de ruído, na bateria e nos controles. A garantia não cobre danos causados por quedas, líquidos fora da especificação IPX5 ou desgaste natural das almofadas.'
  },
  {
    q: 'O cancelamento de ruído funciona bem em avião?',
    a: 'Sim. O ANC adaptativo do ÓRBITA foi calibrado para frequências de baixa intensidade, como o ronco constante de motores a jato. Em voos, a redução chega a -42 dB nas médias. O modo também compensa mudanças de pressão automaticamente, o que reduz a sensação de abafamento durante a decolagem e o pouso.'
  },
  {
    q: 'A bateria dura mesmo 60 horas?',
    a: 'Os 60 horas são medidos em laboratório com ANC desligado e volume a 50% via AAC. No uso real, espera-se entre 45 e 55 horas com ANC ativo e codecs de alta resolução como LDAC. Mesmo com carga parcial, 10 minutos no carregador rendem cerca de 5 horas de reprodução.'
  },
  {
    q: 'Posso devolver se não gostar?',
    a: 'Você tem 30 dias a partir do recebimento para solicitar a devolução, sem burocracia. O produto deve estar na embalagem original, com todos os acessórios. Assim que o item chegar ao nosso centro, o reembolso é processado em até 5 dias úteis.'
  },
  {
    q: 'Com quais dispositivos o ÓRBITA é compatível?',
    a: 'O ÓRBITA usa Bluetooth 5.4 e suporta multiponto para conectar dois dispositivos ao mesmo tempo. Em codecs, oferece LDAC e aptX Adaptive para Android, além de AAC para iPhone, iPad e Mac. Também funciona com cabo P2 para fontes analógicas ou em modo avião.'
  }
];

function padIndex(i) {
  return String(i + 1).padStart(2, '0');
}

export function initFaq(el) {
  if (!el) return;

  el.innerHTML = `
    <div class="container">
      <header class="faq__header" data-reveal>
        <span class="mono faq__eyebrow">SYS.05 — DÚVIDAS</span>
        <h2 class="faq__title" id="faq-title">Perguntas Frequentes</h2>
      </header>
      <dl class="faq__list">
        ${FAQS.map((item, i) => `
          <div class="faq__item" data-reveal="${i + 1}">
            <dt class="faq__term">
              <button
                type="button"
                class="faq__question"
                aria-expanded="false"
                aria-controls="faq-panel-${i}"
                id="faq-question-${i}"
              >
                <span class="mono faq__index">${padIndex(i)}</span>
                <span class="faq__question-text">${item.q}</span>
                <span class="faq__icon" aria-hidden="true"><span></span><span></span></span>
              </button>
            </dt>
            <dd
              class="faq__panel"
              role="region"
              aria-labelledby="faq-question-${i}"
              id="faq-panel-${i}"
            >
              <div class="faq__answer">
                ${item.a}
              </div>
            </dd>
          </div>
        `).join('')}
      </dl>
    </div>
  `;

  const items = Array.from(el.querySelectorAll('.faq__item'));
  const buttons = Array.from(el.querySelectorAll('.faq__question'));
  const panels = Array.from(el.querySelectorAll('.faq__panel'));

  let openIndex = -1;

  function open(index) {
    const btn = buttons[index];
    const panel = panels[index];
    const item = items[index];

    btn.setAttribute('aria-expanded', 'true');
    item.classList.add('is-open');
    panel.classList.add('is-open');

    if (reducedMotion()) {
      panel.style.height = 'auto';
      return;
    }

    panel.style.height = `${panel.scrollHeight}px`;
  }

  function close(index) {
    const btn = buttons[index];
    const panel = panels[index];
    const item = items[index];

    btn.setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open');
    panel.classList.remove('is-open');

    if (reducedMotion()) {
      panel.style.height = '';
      return;
    }

    const h = panel.scrollHeight;
    panel.style.height = `${h}px`;
    panel.offsetHeight; // force reflow
    panel.style.height = '0px';
  }

  function toggle(targetIndex) {
    if (targetIndex === openIndex) {
      close(openIndex);
      openIndex = -1;
      return;
    }

    if (openIndex !== -1) {
      close(openIndex);
    }

    open(targetIndex);
    openIndex = targetIndex;
  }

  function onTransitionEnd(e) {
    if (e.propertyName !== 'height') return;
    const panel = e.currentTarget;
    if (panel.classList.contains('is-open')) {
      panel.style.height = 'auto';
    }
  }

  function onKeyDown(e) {
    const index = buttons.indexOf(e.currentTarget);
    if (index === -1) return;

    let nextIndex = index;

    switch (e.key) {
      case 'ArrowDown':
        nextIndex = (index + 1) % buttons.length;
        break;
      case 'ArrowUp':
        nextIndex = (index - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    buttons[nextIndex].focus();
  }

  function onResize() {
    const openPanel = panels.find((p) => p.classList.contains('is-open'));
    if (!openPanel) return;

    openPanel.style.height = `${openPanel.scrollHeight}px`;
    openPanel.offsetHeight; // reflow
    openPanel.style.height = 'auto';
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => toggle(i));
    btn.addEventListener('keydown', onKeyDown);
  });

  panels.forEach((panel) => {
    panel.addEventListener('transitionend', onTransitionEnd);
  });

  window.addEventListener('resize', onResize);

  observeReveal(el);
}
