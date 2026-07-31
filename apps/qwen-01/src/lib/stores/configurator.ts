import { writable, derived } from 'svelte/store';

export interface ColorOption {
	id: string;
	name: string;
	hex: string;
	hexLight: string;
	price: number;
}

export interface ModeOption {
	id: string;
	name: string;
	description: string;
	priceModifier: number;
}

export const COLORS: ColorOption[] = [
	{ id: 'graphite', name: 'Grafite', hex: '#2a2a2e', hexLight: '#3a3a40', price: 2499 },
	{ id: 'silver', name: 'Prata Lunar', hex: '#c8c4be', hexLight: '#b0aca6', price: 2499 },
	{ id: 'blue', name: 'Azul Abissal', hex: '#1a3a5c', hexLight: '#2a4a6c', price: 2599 },
	{ id: 'amber', name: 'Âmbar Solar', hex: '#b87020', hexLight: '#a06018', price: 2699 }
];

export const MODES: ModeOption[] = [
	{ id: 'immersive', name: 'Imersivo', description: 'ANC máximo, isolamento total', priceModifier: 0 },
	{ id: 'studio', name: 'Estúdio', description: 'Resposta plana, mixagem precisa', priceModifier: 200 },
	{ id: 'ambient', name: 'Ambiente', description: 'Transparência adaptativa', priceModifier: 100 }
];

export const selectedColor = writable<ColorOption>(COLORS[0]);
export const selectedMode = writable<ModeOption>(MODES[0]);
export const totalPrice = derived([selectedColor, selectedMode], ([$color, $mode]) => $color.price + $mode.priceModifier);
