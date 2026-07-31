export interface FaqItem {
	question: string;
	answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
	{
		question: 'O que é cancelamento de ruído adaptativo espacial?',
		answer:
			'Diferente do ANC tradicional que trata o som como um sinal plano, o ÓRBITA mapeia o ambiente em três dimensões usando 8 microfones externos. Ele identifica a direção de cada fonte de ruído e cria zonas de silêncio seletivas ao redor da sua cabeça — como uma bolha acústica pessoal.'
	},
	{
		question: 'Qual a diferença entre os modos de som?',
		answer:
			'Imersivo: ANC máximo com assinatura em V (graves e agudos levemente elevados). Estúdio: resposta plana de 20Hz–20kHz para mixagem e masterização. Ambiente: transparência adaptativa que deixa vozes e alertas passarem enquanto reduz ruído de fundo.'
	},
	{
		question: 'Funciona com cabo?',
		answer:
			'Sim. Acompanha cabo USB-C para áudio digital (24-bit/96kHz) e adaptador P2 para uso analógico passivo. No modo passivo, a bateria não é consumida.'
	},
	{
		question: 'Como funciona a garantia?',
		answer:
			'2 anos de garantia contra defeitos de fabricação, cobrindo drivers, bateria e eletrônica. Almofadas e headband têm 1 ano. Registro no site estende a garantia em 6 meses.'
	},
	{
		question: 'É confortável para uso prolongado?',
		answer:
			'O ÓRBITA pesa 248g com distribuição de pressão otimizada. As almofadas de espuma viscoelástica com revestimento em proteína de couro se adaptam ao formato da orelha em ~30 segundos. A força de clamp é calibrada para vedação sem desconforto.'
	}
];
