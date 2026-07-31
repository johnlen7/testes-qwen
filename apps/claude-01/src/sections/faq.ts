import './faq.css';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Quanto tempo de bateria o ÓRBITA entrega?',
    answer:
      'Até 38 horas com cancelamento de ruído ativo, ou 52 horas no modo Adaptativo padrão. Um encaixe de 10 minutos no case devolve 6 horas de uso — carregamento total em pouco mais de uma hora.',
  },
  {
    question: 'O que vem dentro da caixa?',
    answer:
      'O fone ÓRBITA, case de carregamento em liga de alumínio escovado, cabo USB-C para USB-C trançado, dois pares extras de almofadas (S e L) e o cartão de garantia com o número de série gravado a laser.',
  },
  {
    question: 'Ele aguenta suor e chuva leve?',
    answer:
      'Sim. Selo IPX4 nas conchas e no arco de cabeça protege contra respingo, suor intenso e chuva fina. Não é recomendado para imersão — evite nadar ou mergulhar com o ÓRBITA.',
  },
  {
    question: 'Funciona com qualquer celular, tablet ou notebook?',
    answer:
      'O ÓRBITA usa Bluetooth 5.3 com multiponto: pareia com dois dispositivos simultaneamente e alterna entre eles automaticamente, seja Android, iOS, Windows ou macOS. Também aceita conexão com fio via P2 para equipamentos sem Bluetooth.',
  },
  {
    question: 'Posso trocar a cor das conchas depois da compra?',
    answer:
      'As conchas são modulares e destacáveis. Vendemos kits avulsos nas quatro cores da coleção — basta encaixar até ouvir o clique. Nenhuma ferramenta é necessária e a troca não afeta a garantia.',
  },
  {
    question: 'Qual a diferença entre os modos Adaptativo e Estúdio?',
    answer:
      'Adaptativo ajusta a curva de frequência em tempo real conforme o ambiente e o volume. Estúdio trava uma resposta plana, pensada para mixagem e monitoramento fiel — ideal para quem produz ou revisa áudio.',
  },
  {
    question: 'Como funciona a garantia?',
    answer:
      'Dois anos de garantia internacional contra defeito de fabricação, sem custo de envio para o primeiro reparo. A bateria tem cobertura própria de 18 meses para retenção mínima de 80% da capacidade original.',
  },
  {
    question: 'Existe política de devolução?',
    answer:
      'Sim, 30 dias corridos a partir do recebimento, sem necessidade de justificativa, desde que o produto volte na embalagem original com todos os acessórios. O estorno cai em até 10 dias úteis após a inspeção.',
  },
];

export function mount(container: HTMLElement): void {
  const section = document.createElement('section');
  section.id = 'faq';
  section.setAttribute('aria-labelledby', 'faq-heading');

  const inner = document.createElement('div');
  inner.className = 'container faq-container';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Perguntas frequentes';

  const heading = document.createElement('h2');
  heading.id = 'faq-heading';
  heading.className = 'faq-heading';
  heading.textContent = 'Antes de decidir, as respostas diretas.';

  const list = document.createElement('div');
  list.className = 'faq-list';

  const triggers: HTMLButtonElement[] = [];

  FAQ_ITEMS.forEach((item, index) => {
    const itemId = `faq-${index}`;
    const triggerId = `${itemId}-trigger`;
    const panelId = `${itemId}-panel`;

    const heading3 = document.createElement('h3');
    heading3.className = 'faq-item-heading';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = triggerId;
    trigger.className = 'faq-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);

    const questionText = document.createElement('span');
    questionText.className = 'faq-question-text';
    questionText.textContent = item.question;

    const icon = createToggleIcon();

    trigger.append(questionText, icon);
    heading3.append(trigger);

    const panel = document.createElement('div');
    panel.className = 'faq-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    const panelInner = document.createElement('div');
    panelInner.className = 'faq-panel-inner';

    const answer = document.createElement('p');
    answer.className = 'faq-answer';
    answer.textContent = item.answer;

    panelInner.append(answer);
    panel.append(panelInner);

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      setOpen(trigger, panel, !isOpen);
      if (!isOpen) {
        closeOthers(list, trigger);
      }
    });

    list.append(heading3, panel);
    triggers.push(trigger);
  });

  initArrowKeyNavigation(triggers);

  inner.append(eyebrow, heading, list);
  section.append(inner);
  container.append(section);
}

function createToggleIcon(): SVGSVGElement {
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('class', 'faq-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const vertical = document.createElementNS(svgNs, 'line');
  vertical.setAttribute('x1', '12');
  vertical.setAttribute('y1', '5');
  vertical.setAttribute('x2', '12');
  vertical.setAttribute('y2', '19');

  const horizontal = document.createElementNS(svgNs, 'line');
  horizontal.setAttribute('x1', '5');
  horizontal.setAttribute('y1', '12');
  horizontal.setAttribute('x2', '19');
  horizontal.setAttribute('y2', '12');

  svg.append(vertical, horizontal);
  return svg;
}

function setOpen(trigger: HTMLButtonElement, panel: HTMLElement, open: boolean): void {
  trigger.setAttribute('aria-expanded', String(open));
  panel.classList.toggle('is-open', open);
}

function closeOthers(list: HTMLElement, current: HTMLButtonElement): void {
  const otherTriggers = Array.from(list.querySelectorAll<HTMLButtonElement>('.faq-trigger')).filter(
    (el) => el !== current
  );
  otherTriggers.forEach((trigger) => {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId ? list.querySelector<HTMLElement>(`#${panelId}`) : null;
    if (panel) setOpen(trigger, panel, false);
  });
}

/**
 * Navegação por seta ↑/↓ e Home/End entre as perguntas, seguindo o padrão WAI-ARIA
 * de accordion: move apenas o foco (Tab continua percorrendo todos os botões em ordem
 * natural — diferente de um radiogroup, não há roving tabindex aqui).
 */
function initArrowKeyNavigation(triggers: HTMLButtonElement[]): void {
  triggers.forEach((trigger, index) => {
    trigger.addEventListener('keydown', (event) => {
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowDown':
          nextIndex = (index + 1) % triggers.length;
          break;
        case 'ArrowUp':
          nextIndex = (index - 1 + triggers.length) % triggers.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = triggers.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      triggers[nextIndex]?.focus();
    });
  });
}
