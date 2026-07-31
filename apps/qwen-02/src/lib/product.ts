/* Dados do produto ÓRBITA — todo o conteúdo é hardcoded/mockado aqui. */

export interface ColorOption {
  id: string
  name: string
  /** cor exibida no swatch */
  swatch: string
  /** fills do SVG do fone */
  shell: string
  cup: string
  cushion: string
  band: string
  metal: string
}

export interface SizeOption {
  id: string
  name: string
  short: string
  price: number
  desc: string
  /** escala visual das conchas no SVG */
  cupScale: number
}

export interface Feature {
  id: string
  icon: 'anc' | 'battery' | 'orbit' | 'bluetooth' | 'charge'
  title: string
  desc: string
}

export interface Testimonial {
  quote: string
  name: string
  role: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface StoryStep {
  index: string
  title: string
  desc: string
}

export const COLORS: ColorOption[] = [
  {
    id: 'grafite',
    name: 'Grafite',
    swatch: '#2b2f38',
    shell: '#2b2f38',
    cup: '#1f232b',
    cushion: '#13161b',
    band: '#26292f',
    metal: '#5a616e',
  },
  {
    id: 'prata',
    name: 'Prata Lunar',
    swatch: '#cdd2dc',
    shell: '#cdd2dc',
    cup: '#b2b8c4',
    cushion: '#2a2d34',
    band: '#c2c8d2',
    metal: '#e7ebf1',
  },
  {
    id: 'meia-noite',
    name: 'Meia-noite',
    swatch: '#22345c',
    shell: '#24375f',
    cup: '#1a2947',
    cushion: '#0f1729',
    band: '#1e2f52',
    metal: '#4f628f',
  },
  {
    id: 'areia',
    name: 'Areia Solar',
    swatch: '#d9c6a4',
    shell: '#d9c6a4',
    cup: '#c3ae88',
    cushion: '#3a332a',
    band: '#ccba97',
    metal: '#b9aa89',
  },
]

export const SIZES: SizeOption[] = [
  {
    id: 'over-ear',
    name: 'Over-ear',
    short: 'Over-ear',
    price: 2499,
    desc: 'Conchas circumaurais que envolvem a orelha. Isolamento máximo e palco sonoro amplo.',
    cupScale: 1,
  },
  {
    id: 'on-ear',
    name: 'On-ear',
    short: 'On-ear',
    price: 1999,
    desc: 'Conchas supraaurais compactas. Mais leve e portátil, com a mesma assinatura sonora.',
    cupScale: 0.82,
  },
]

export const FEATURES: Feature[] = [
  {
    id: 'anc',
    icon: 'anc',
    title: 'ANC adaptativo espacial',
    desc: 'Oito microfones mapeiam o ambiente 50.000 vezes por segundo e ajustam o cancelamento à sua posição no espaço.',
  },
  {
    id: 'orbit',
    icon: 'orbit',
    title: 'Áudio 360° que orbita',
    desc: 'Head-tracking de precisão mantém o palco sonoro fixo no mundo enquanto você se move dentro dele.',
  },
  {
    id: 'battery',
    icon: 'battery',
    title: '40 horas de bateria',
    desc: 'Um dia inteiro de voo transatlântico com ANC ligado. Modo economia estende para 60 horas.',
  },
  {
    id: 'charge',
    icon: 'charge',
    title: 'Carga rápida USB-C',
    desc: 'Cinco minutos na tomada rendem quatro horas de reprodução. Carga completa em menos de uma hora.',
  },
  {
    id: 'bluetooth',
    icon: 'bluetooth',
    title: 'Bluetooth 5.4 multiponto',
    desc: 'Conecte notebook e celular ao mesmo tempo e alterne entre eles sem tocar em nada.',
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'O silêncio é tão completo que eu esqueço que estou usando fone. É outra categoria de produto.',
    name: 'Marina Alves',
    role: 'Produtora musical',
  },
  {
    quote: 'O áudio espacial é a primeira coisa que realmente me fez virar a cabeça procurando a fonte.',
    name: 'Rafael Costa',
    role: 'Engenheiro de som',
  },
  {
    quote: 'Quarenta horas reais de bateria. Parei de levar o carregador em viagens curtas.',
    name: 'Júlia Nakamura',
    role: 'Consultora de viagens',
  },
  {
    quote: 'A construção passa sensação de objeto de precisão, não de eletrônico descartável.',
    name: 'André Peixoto',
    role: 'Designer industrial',
  },
  {
    quote: 'Uso em open office o dia todo. O ANC adaptativo lida com ar-condicionado e conversa sem esforço.',
    name: 'Camila Rocha',
    role: 'Desenvolvedora',
  },
  {
    quote: 'O multiponto funciona de verdade. Notebook e celular alternando sem aquele ritual chato.',
    name: 'Bruno Farias',
    role: 'Gerente de produto',
  },
  {
    quote: 'Graves firmes, agudos limpos. Não é assinatura "divertida" artificial — é honesta.',
    name: 'Letícia Moura',
    role: 'DJ e curadora',
  },
  {
    quote: 'Conforto absurdo. Passo oito horas com ele e esqueço que está na minha cabeça.',
    name: 'Tiago Santos',
    role: 'Editor de vídeo',
  },
]

export const FAQ: FaqItem[] = [
  {
    q: 'O que significa "cancelamento adaptativo espacial"?',
    a: 'O ÓRBITA usa oito microfones e um sensor de posição para recalibrar o cancelamento de ruído conforme você se move. Diferente do ANC fixo, ele reage a mudanças no ambiente — como uma porta que se abre ou um avião que muda de altitude — em tempo real.',
  },
  {
    q: 'Qual a diferença entre Over-ear e On-ear?',
    a: 'O Over-ear tem conchas que envolvem completamente a orelha, oferecendo o máximo de isolamento e o palco sonoro mais amplo. O On-ear é mais compacto e leve, apoiando-se sobre a orelha. Ambos compartilham os mesmos drivers e a mesma assinatura sonora.',
  },
  {
    q: 'A bateria realmente dura 40 horas?',
    a: 'Sim, com cancelamento de ruído ativo e volume a 50%. Com ANC desligado e em modo economia, a autonomia chega a 60 horas. Uma carga completa leva cerca de 55 minutos via USB-C.',
  },
  {
    q: 'Funciona com qualquer dispositivo?',
    a: 'O ÓRBITA usa Bluetooth 5.4 e é compatível com qualquer dispositivo com Bluetooth — celulares, notebooks, tablets e consoles. Um cabo P2 acompanha o produto para uso com fio quando necessário.',
  },
  {
    q: 'Como funciona a garantia e a devolução?',
    a: 'Dois anos de garantia contra defeitos de fabricação e 30 dias para devolução sem perguntas. Se não for o melhor fone que você já usou, devolvemos o valor integral.',
  },
  {
    q: 'O produto é real?',
    a: 'Não — o ÓRBITA é um produto fictício criado como demonstração de engenharia frontend. Esta página é um exercício de design, animação e interatividade; nenhum pedido é processado.',
  },
]

export const STORY_STEPS: StoryStep[] = [
  {
    index: '01',
    title: 'Silêncio que se adapta',
    desc: 'Oito microfones escutam o mundo ao seu redor e geram uma onda inversa exata. O resultado é um silêncio que se molda ao ambiente em tempo real.',
  },
  {
    index: '02',
    title: 'Engenharia em camadas',
    desc: 'Drivers de 40mm, câmara acústica selada e almofadas de espuma viscoelástica. Cada componente projetado para desaparecer — e deixar só o som.',
  },
  {
    index: '03',
    title: 'Áudio que orbita você',
    desc: 'O palco sonoro permanece fixo no espaço enquanto você se move. Vire a cabeça e a música fica exatamente onde estava.',
  },
]
