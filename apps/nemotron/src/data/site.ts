/* ============================================================
   ÓRBITA — dados do produto (hardcoded, sem backend)
   ============================================================ */

export interface ProductColor {
  id: string;
  name: string;
  /** cor principal da concha */
  shell: string;
  /** sombra para profundidade */
  shade: string;
  /** tom do halo */
  glow: string;
  /** preço adicional em reais */
  priceDelta: number;
}

export const COLORS: ProductColor[] = [
  { id: 'grafite', name: 'Grafite', shell: '#3d3f45', shade: '#26272c', glow: 'rgba(120,125,140,0.5)', priceDelta: 0 },
  { id: 'prata', name: 'Prata', shell: '#c9ccd3', shade: '#8f96a1', glow: 'rgba(180,190,205,0.5)', priceDelta: 0 },
  { id: 'solar', name: 'Solar', shell: '#e8a33d', shade: '#a9701c', glow: 'rgba(232,163,61,0.55)', priceDelta: 199 },
  { id: 'noite', name: 'Azul-noite', shell: '#37466b', shade: '#202a45', glow: 'rgba(80,110,180,0.5)', priceDelta: 0 },
  { id: 'poente', name: 'Rosa-poente', shell: '#c97b8d', shade: '#8f4f5e', glow: 'rgba(200,120,140,0.5)', priceDelta: 149 },
];

export interface SoundMode {
  id: string;
  name: string;
  desc: string;
  priceDelta: number;
}

export const SOUND_MODES: SoundMode[] = [
  { id: 'imersivo', name: 'Imersivo', desc: 'Grave presente, palco amplo.', priceDelta: 0 },
  { id: 'focado', name: 'Focado', desc: 'Vocais à frente, ruído dobrado.', priceDelta: 249 },
  { id: 'espacial', name: 'Espacial', desc: 'Áudio 3D com head-tracking.', priceDelta: 549 },
];

export const BASE_PRICE = 2499;

export const getPrice = (colorId: string, modeId: string) => {
  const c = COLORS.find((x) => x.id === colorId) ?? COLORS[0];
  const m = SOUND_MODES.find((x) => x.id === modeId) ?? SOUND_MODES[0];
  return BASE_PRICE + c.priceDelta + m.priceDelta;
};

/* ------------------------------ Features ------------------------------ */

export interface Feature {
  title: string;
  desc: string;
  icon: 'wave' | 'orbit' | 'battery' | 'link' | 'driver' | 'weight';
}

export const FEATURES: Feature[] = [
  {
    title: 'Cancelamento adaptativo espacial',
    desc: 'Oito microfones lêem o ambiente 400× por segundo e esculpem o silêncio ao redor de você — no avião, no metrô, no escritório.',
    icon: 'wave',
  },
  {
    title: 'Áudio espacial com head-tracking',
    desc: 'O som fica ancorado no espaço, não na sua cabeça. Vire-se e a cena gira com você, como uma sala de concerto invisível.',
    icon: 'orbit',
  },
  {
    title: '40 horas de voo',
    desc: 'Uma semana de uso real. E com 10 minutos de carga você recupera 4 horas de reprodução — o suficiente para atravessar o dia.',
    icon: 'battery',
  },
  {
    title: 'Bluetooth 5.4 multiponto',
    desc: 'Conectado ao notebook e ao telefone ao mesmo tempo. A chamada entra, o ÓRBITA troca de fonte sozinho e volta depois.',
    icon: 'link',
  },
  {
    title: 'Drivers de 40mm com câmara dupla',
    desc: 'Uma câmara para o grave, outra para o detalhe. Cada nota respira no próprio espaço, sem se atropelar.',
    icon: 'driver',
  },
  {
    title: '258g em alumínio aeronáutico',
    desc: 'Pesado no papel, leve na cabeça. A concha gira 360° e a almofada de memória se molda ao seu ouvido.',
    icon: 'weight',
  },
];

/* ------------------------------ Depoimentos ------------------------------ */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'O cancelamento de ruído do ÓRBITA é assustador de bom. O avião some e o que sobra é só a música.',
    name: 'Marina Duarte',
    role: 'Crítica de áudio · Sound Weekly',
    initials: 'MD',
  },
  {
    quote: 'A primeira vez que ouvi o modo Espacial eu ri sozinho no estúdio. Parece que a banda está no quarto com você.',
    name: 'Rafael Tavares',
    role: 'Produtor musical',
    initials: 'RT',
  },
  {
    quote: 'Uso o dia inteiro em reunião e esqueço que estou usando. 258 gramas é magia, não engenharia.',
    name: 'Camila Rocha',
    role: 'Engenheira de produto',
    initials: 'CR',
  },
  {
    quote: 'Já testei fones de R$ 8 mil. O ÓRBITA entrega 90% da experiência por um terço do preço.',
    name: 'Diego Santoro',
    role: 'Reviewer · AudioBrasil',
    initials: 'DS',
  },
  {
    quote: 'A bateria dura tanto que eu desisti de carregar cabo na mochila. Foi um processo de luto rápido.',
    name: 'Juliana Faria',
    role: 'Arquiteta · usuária há 6 meses',
    initials: 'JF',
  },
  {
    quote: 'O design é o primeiro em anos que não parece uma gambiarra de plástico. É um objeto de desejo.',
    name: 'Pedro Azevedo',
    role: 'Designer industrial',
    initials: 'PA',
  },
];

/* ------------------------------ FAQ ------------------------------ */

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'O cancelamento adaptativo espacial é diferente do ANC comum?',
    a: 'Sim. O ANC comum aplica uma curva fixa de cancelamento. O ÓRBITA lê o ambiente em tempo real — 400 amostras por segundo, em oito microfones — e recalcula o cancelamento por faixa de frequência. No avião ele cancela o ronco; numa conversa ao fundo, preserva o que interessa. É por isso que chamamos de adaptativo espacial.',
  },
  {
    q: 'Quanto dura a bateria e como é a carga rápida?',
    a: 'São 40 horas de reprodução com o ANC ligado — cerca de uma semana de uso real. Com 10 minutos no carregador USB-C você recupera 4 horas. A carga completa leva 75 minutos e a caixa inclui o cabo trançado de 1,5m.',
  },
  {
    q: 'Consigo conectar em dois dispositivos ao mesmo tempo?',
    a: 'Sim, o Bluetooth 5.4 multiponto mantém duas conexões simultâneas. Se uma chamada chega no telefone enquanto você ouve música no notebook, o ÓRBITA troca de fonte sozinho e, ao fim da chamada, volta para a música automaticamente.',
  },
  {
    q: 'O que vem na caixa?',
    a: 'O fone ÓRBITA, um estojo rígido de viagem, cabo USB-C trançado, cabo P3 3,5mm com DAC integrado, adaptador de avião e três pares de almofadas de reposição (o encaixe é magnético e leva 3 segundos para trocar).',
  },
  {
    q: 'Qual é a garantia e a política de devolução?',
    a: 'Garantia de 2 anos contra defeitos de fabricação, com assistência no Brasil. Você tem 30 dias para devolver sem custo, sem perguntas — se não amar, devolve.',
  },
  {
    q: 'Quando chega e quanto custa o frete?',
    a: 'O envio é grátis para todo o Brasil e leva de 3 a 7 dias úteis, com rastreio. Nas capitais do Sudeste, a entrega expressa chega em 1 a 2 dias úteis.',
  },
];

/* ------------------------------ Navegação ------------------------------ */

export const NAV = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#configurar', label: 'Configurar' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
];
