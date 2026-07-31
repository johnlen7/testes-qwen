import type { FAQItem, Feature, ProductAttribute, ProductColor, Testimonial } from '../types';

export const productCatalog = {
  basePrice: 2499,
  colors: [
    {
      id: 'graphite',
      label: 'Grafite',
      shortLabel: 'GRA',
      hex: '#89959B',
      shadow: '#2B353B',
      priceDelta: 0,
      description: 'A leitura mais precisa do objeto. Cinza mineral, sem reflexo fácil.',
    },
    {
      id: 'lunar',
      label: 'Lunar',
      shortLabel: 'LUN',
      hex: '#DDE5E2',
      shadow: '#8B9B9B',
      priceDelta: 120,
      description: 'Um acabamento claro que devolve a luz em vez de disputar com ela.',
    },
    {
      id: 'ember',
      label: 'Ember',
      shortLabel: 'EMB',
      hex: '#FF8968',
      shadow: '#6F3025',
      priceDelta: 180,
      description: 'Cor solar e baixa saturação. Um sinal quente no silêncio.',
    },
    {
      id: 'moss',
      label: 'Moss',
      shortLabel: 'MOS',
      hex: '#91B6A5',
      shadow: '#365A4D',
      priceDelta: 160,
      description: 'Verde de baixa frequência, pensado para desaparecer no cotidiano.',
    },
  ] satisfies ProductColor[],
  attributes: [
    {
      id: 'focus',
      label: 'Focus',
      description: 'Isola vozes e detalhes com uma resposta mais seca.',
      priceDelta: 0,
      visual: 'focus',
    },
    {
      id: 'spatial',
      label: 'Spatial',
      description: 'Abre o palco ao redor da cabeça para uma escuta mais ampla.',
      priceDelta: 220,
      visual: 'spatial',
    },
    {
      id: 'open',
      label: 'Open air',
      description: 'Mantém o ambiente próximo quando você precisa voltar a ele.',
      priceDelta: 140,
      visual: 'open',
    },
  ] satisfies ProductAttribute[],
};

export const features: Feature[] = [
  {
    id: 'adaptive',
    eyebrow: 'SILÊNCIO ADAPTATIVO',
    title: 'O espaço muda antes do ruído.',
    description: 'Microfones internos leem a sala e ajustam o cancelamento em tempo real, sem menus.',
    metric: '360°',
    metricLabel: 'leitura espacial',
    tone: 'cyan',
  },
  {
    id: 'battery',
    eyebrow: 'ENERGIA',
    title: 'Uma semana de escuta real.',
    description: 'Até 42 horas por carga, com 10 minutos de energia para a próxima travessia.',
    metric: '42h',
    metricLabel: 'por carga',
    tone: 'graphite',
  },
  {
    id: 'comfort',
    eyebrow: 'MATERIAL',
    title: 'Leve onde importa.',
    description: 'Arco de liga flexível e conchas que distribuem o peso, não apertam a cabeça.',
    metric: '248g',
    metricLabel: 'de presença',
    tone: 'mist',
  },
  {
    id: 'translation',
    eyebrow: 'CONEXÃO',
    title: 'Duas fontes. Um gesto.',
    description: 'Troque do notebook para o telefone com uma pausa curta e sem procurar configurações.',
    metric: '02',
    metricLabel: 'fontes pareadas',
    tone: 'ember',
  },
  {
    id: 'repair',
    eyebrow: 'CICLO',
    title: 'Feito para continuar.',
    description: 'Almofadas, arco e bateria são substituíveis. O objeto acompanha o seu ritmo.',
    metric: '04',
    metricLabel: 'partes trocáveis',
    tone: 'graphite',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'ines',
    quote: 'O mais perto que já cheguei de desligar a sala sem desligar o mundo.',
    name: 'Inês Viana',
    role: 'Diretora de som',
    location: 'São Paulo',
  },
  {
    id: 'caio',
    quote: 'A troca de perfil é física. Você sente a sala abrir antes de perceber o botão.',
    name: 'Caio Furtado',
    role: 'Arquiteto',
    location: 'Recife',
  },
  {
    id: 'maira',
    quote: 'Ele parece ter sido desenhado para ficar na mesa, não para ser escondido na mochila.',
    name: 'Maíra Sato',
    role: 'Fotógrafa',
    location: 'Curitiba',
  },
  {
    id: 'rafael',
    quote: 'O silêncio não é vazio aqui. Ele tem profundidade e direção.',
    name: 'Rafael Diniz',
    role: 'Produtor musical',
    location: 'Belo Horizonte',
  },
];

export const faqs: FAQItem[] = [
  {
    id: 'noise',
    question: 'O cancelamento funciona em ambientes diferentes?',
    answer: 'Sim. O sistema espacial mede o som dentro e fora das conchas e ajusta a resposta continuamente. Avião, café ou escritório entram na mesma leitura.',
  },
  {
    id: 'comfort',
    question: 'Como o ÓRBITA se comporta depois de algumas horas?',
    answer: 'O arco distribui a pressão e as conchas têm espuma de memória com troca simples. O peso é distribuído em três pontos para não concentrar carga em um só lugar.',
  },
  {
    id: 'devices',
    question: 'Posso alternar entre mais de um dispositivo?',
    answer: 'Você pode manter dois dispositivos pareados e alternar entre eles com um toque. O perfil de escuta continua salvo para cada contexto.',
  },
  {
    id: 'delivery',
    question: 'Quando o pedido é enviado?',
    answer: 'O envio simulado desta experiência considera até 3 dias úteis para preparação e rastreio por e-mail a partir da confirmação.',
  },
];
