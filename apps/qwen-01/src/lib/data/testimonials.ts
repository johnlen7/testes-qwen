export interface Testimonial {
	quote: string;
	name: string;
	role: string;
	avatarHue: number;
}

export const TESTIMONIALS: Testimonial[] = [
	{
		quote:
			'O cancelamento de ruído do ÓRBITA é de outro planeta. Uso em estúdio e finalmente ouço cada detalhe da mix.',
		name: 'Marina Costa',
		role: 'Engenheira de Áudio',
		avatarHue: 35
	},
	{
		quote:
			'60 horas de bateria não é marketing — testei. Três voos transatlânticos sem carregar.',
		name: 'Rafael Tanaka',
		role: 'Consultor de Viagens',
		avatarHue: 200
	},
	{
		quote:
			'Já testei todos os flagships do mercado. O ÓRBITA é o primeiro que me fez esquecer que estava usando fone.',
		name: 'Lucas Andrade',
		role: 'Reviewer de Tech',
		avatarHue: 280
	},
	{
		quote:
			'O modo Ambiente é surreal. Converso com colegas sem tirar o fone e a transição é imperceptível.',
		name: 'Camila Ferreira',
		role: 'Product Designer',
		avatarHue: 150
	},
	{
		quote:
			'Leve demais. Esqueço que está na cabeça durante as 8 horas de trabalho remoto.',
		name: 'Pedro Almeida',
		role: 'Dev Full-Stack',
		avatarHue: 320
	},
	{
		quote:
			'A latência de 18ms no modo gaming é real. Finalmente um fone wireless que serve pra competitivo.',
		name: 'Beatriz Santos',
		role: 'Pro Player',
		avatarHue: 60
	}
];
