export interface Feature {
	title: string;
	description: string;
	icon: string;
}

export const FEATURES: Feature[] = [
	{
		title: 'ANC Adaptativo Espacial',
		description:
			'Mapeia o ambiente 500× por segundo e ajusta o cancelamento de ruído em 3D ao seu redor.',
		icon: 'anc'
	},
	{
		title: '60h de Bateria',
		description:
			'Três dias de uso contínuo com ANC ligado. Carga rápida: 5 min = 4 horas de reprodução.',
		icon: 'battery'
	},
	{
		title: 'Bluetooth 5.4 LE',
		description:
			'Conexão multiponto com latência de 18ms. Troque entre dispositivos sem interrupção.',
		icon: 'bluetooth'
	},
	{
		title: 'Driver Planar 50mm',
		description:
			'Diafragma planar magnético com resposta de 4Hz–44kHz. Distorção < 0.02% THD.',
		icon: 'driver'
	},
	{
		title: '6 Mic Beamforming',
		description:
			'Array de microfones com IA isola sua voz em qualquer ambiente. Chamadas cristalinas.',
		icon: 'mic'
	},
	{
		title: '248g Ultraleve',
		description:
			'Estrutura em liga de magnésio com almofadas de memória adaptativa. Pressão zero.',
		icon: 'weight'
	}
];
