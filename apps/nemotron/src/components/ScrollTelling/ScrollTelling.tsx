import { useRef, type ReactNode, type RefObject } from 'react';
import ProductGraphic from '../ProductGraphic/ProductGraphic';
import { COLORS } from '../../data/site';
import { useScrollProgress } from '../../lib/useScrollProgress';
import { window01 } from '../../lib/motion';
import './ScrollTelling.css';

interface Step {
  ref: RefObject<HTMLDivElement | null>;
  num: string;
  title: ReactNode;
  text: string;
  /** janela [a, b] do progresso em que o texto entra */
  enter: readonly [number, number];
  /** janela em que o texto sai; null = fica até o fim */
  exit: readonly [number, number] | null;
}

/**
 * Scroll-telling real (scrubbing): a seção ocupa 400vh e o sticky
 * cola na tela enquanto o scroll vira progresso. O callback do
 * useScrollProgress escreve direto no DOM a cada frame — zero
 * re-render — sincronizando explosão/rotação do produto, textos,
 * fundo, rail e cue via vars CSS.
 */
export default function ScrollTelling() {
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tone1Ref = useRef<HTMLDivElement | null>(null);
  const tone2Ref = useRef<HTMLDivElement | null>(null);
  const tone3Ref = useRef<HTMLDivElement | null>(null);
  const step1Ref = useRef<HTMLDivElement | null>(null);
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const step3Ref = useRef<HTMLDivElement | null>(null);

  const STEPS: Step[] = [
    {
      ref: step1Ref,
      num: '01',
      title: (
        <>
          Engenharia <em>silenciosa</em>
        </>
      ),
      text: 'Oito microfones leem o ambiente 400 vezes por segundo e esculpem o silêncio ao redor de você.',
      enter: [0.02, 0.26],
      exit: [0.3, 0.46],
    },
    {
      ref: step2Ref,
      num: '02',
      title: (
        <>
          O que é seu, <em>fica</em>
        </>
      ),
      text: 'O ÓRBITA isola o que você escolheu ouvir e devolve o mundo só quando você quer.',
      enter: [0.38, 0.56],
      exit: [0.6, 0.76],
    },
    {
      ref: step3Ref,
      num: '03',
      title: (
        <>
          Espacial por <em>natureza</em>
        </>
      ),
      text: 'Áudio 3D com head-tracking: a cena sonora fica ancorada no espaço, não na sua cabeça.',
      enter: [0.7, 0.86],
      exit: null,
    },
  ];

  const handleProgress = (p: number) => {
    const sticky = stickyRef.current;
    const svg = svgRef.current;
    const tone1 = tone1Ref.current;
    const tone2 = tone2Ref.current;
    const tone3 = tone3Ref.current;
    if (!sticky || !svg || !tone1 || !tone2 || !tone3) return;

    // Progresso bruto → rail, cue e tons reagem via var(--s) no CSS
    sticky.style.setProperty('--s', String(p));

    // Vars do produto no próprio <svg>: o ProductGraphic define
    // --explode/--spin2 inline no elemento (ProductGraphic.tsx), então
    // valores herdados do sticky seriam sobrescritos — aqui é onde valem.
    svg.style.setProperty('--explode', String(window01(p, 0.12, 0.62)));
    svg.style.setProperty('--spin2', `${p * 160}deg`);

    // Ondas do modo espacial surgem na etapa 3
    svg.style.setProperty('--wave', String(window01(p, 0.68, 0.84)));

    // Textos: entrada na janela [enter], saída em [exit] — só opacity + translateY
    for (const step of STEPS) {
      const el = step.ref.current;
      if (!el) continue;
      const o = Math.min(
        window01(p, step.enter[0], step.enter[1]),
        step.exit ? 1 - window01(p, step.exit[0], step.exit[1]) : 1,
      );
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 28}px)`;
    }

    // Fundo: tom por etapa (só opacity)
    tone1.style.opacity = String(
      window01(p, 0, 0.08) * (1 - window01(p, 0.26, 0.36)),
    );
    tone2.style.opacity = String(
      window01(p, 0.26, 0.38) * (1 - window01(p, 0.6, 0.7)),
    );
    tone3.style.opacity = String(window01(p, 0.58, 0.7));
  };

  const ref = useScrollProgress<HTMLElement>(handleProgress);

  return (
    <section id="como-funciona" className="scrub" ref={ref}>
      <div className="scrub-sticky" ref={stickyRef}>
        {/* Fundo transicional por etapa */}
        <div className="scrub-tone scrub-tone--1" ref={tone1Ref} aria-hidden="true" />
        <div className="scrub-tone scrub-tone--2" ref={tone2Ref} aria-hidden="true" />
        <div className="scrub-tone scrub-tone--3" ref={tone3Ref} aria-hidden="true" />

        {/* Produto central — explode/roda conforme o scroll */}
        <div className="scrub-product" aria-hidden="true">
          <ProductGraphic color={COLORS[0]} ref={svgRef} />
        </div>

        {/* Etapas */}
        {STEPS.map((step, i) => (
          <div key={step.num} className={`scrub-anchor scrub-anchor--${i + 1}`}>
            <div className="scrub-step" ref={step.ref}>
              <span className="scrub-step-num">{step.num}</span>
              <h2 className="scrub-step-title display">{step.title}</h2>
              <p className="scrub-step-text lead">{step.text}</p>
            </div>
          </div>
        ))}

        {/* Indicador de progresso (desktop) */}
        <aside className="scrub-rail" aria-hidden="true">
          <div className="scrub-rail-track">
            <span className="scrub-rail-fill" />
          </div>
          <div className="scrub-rail-num-slot">
            <span className="scrub-rail-num scrub-rail-num--1">01</span>
            <span className="scrub-rail-num scrub-rail-num--2">02</span>
            <span className="scrub-rail-num scrub-rail-num--3">03</span>
          </div>
        </aside>

        {/* Cue do início */}
        <div className="scrub-cue" aria-hidden="true">
          <span className="scrub-cue-label">Role para explorar</span>
          <span className="scrub-cue-line" />
        </div>
      </div>
    </section>
  );
}
