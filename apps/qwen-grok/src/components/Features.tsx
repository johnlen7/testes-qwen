import { useInView } from '../hooks/useInView'
import './features.css'

const FEATURES = [
  {
    id: 'anc',
    title: 'ANC espacial',
    body: 'Mapa esférico de ruído atualizado 384.000 vezes por segundo. Silêncio esculpido, não abafado.',
    icon: IconAnc,
  },
  {
    id: 'drivers',
    title: 'Drivers 40 mm',
    body: 'Diafragma de bio-celulose com resposta plana até 40 kHz. Textura que você sente no peito.',
    icon: IconDriver,
  },
  {
    id: 'latencia',
    title: 'Latência sub-2 ms',
    body: 'Pipeline de cancelamento em silício dedicado. Zero eco fantasma entre o mundo e a mix.',
    icon: IconWave,
  },
  {
    id: 'bateria',
    title: '42 h de órbita',
    body: 'Célula densificada + gestão térmica passiva. Uma carga cobre duas travessias atlânticas.',
    icon: IconBattery,
  },
  {
    id: 'materiais',
    title: 'Carbono & metal',
    body: 'Arco de fibra de carbono, conchas usinadas CNC, cushion de memória de forma open-cell.',
    icon: IconMaterial,
  },
  {
    id: 'app',
    title: 'Campo pessoal',
    body: 'App define zonas de passagem — vozes, sirenes, anúncios — sem desligar o cancelamento.',
    icon: IconField,
  },
] as const

export function Features() {
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <section
      id="features"
      className="section features"
      aria-labelledby="features-title"
      ref={ref}
    >
      <div className="shell">
        <p className="section__eyebrow">Engenharia</p>
        <h2 id="features-title" className="section__title">
          O que orbita por dentro
        </h2>
        <p className="section__lead">
          Cada detalhe existe para uma razão acústica. Nada de checklist genérico —
          só o que muda a forma como você escuta.
        </p>

        <ul className={`features__grid ${inView ? 'is-in' : ''}`}>
          {FEATURES.map((f, i) => (
            <li
              key={f.id}
              className="features__card"
              style={{ ['--i' as string]: String(i) }}
            >
              <div className="features__card-inner">
                <div className="features__icon" aria-hidden="true">
                  <f.icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function IconAnc() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="4" fill="var(--accent)" />
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="var(--accent-2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconDriver() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="9" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="3" fill="var(--accent-2)" />
      <path d="M10 18c4-2 8-3 14-3s10 1 14 3" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    </svg>
  )
}

function IconWave() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <path
        d="M4 24c4-8 8-8 12 0s8 8 12 0 8-8 12 0 8 8 12 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 32c4-5 8-5 12 0s8 5 12 0 8-5 12 0 8 5 12 0"
        stroke="var(--accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function IconBattery() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <rect x="6" y="14" width="32" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="18" width="20" height="12" rx="2" fill="var(--accent)" opacity="0.85" />
      <path d="M38 20h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconMaterial() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <path d="M24 6 40 16v16L24 42 8 32V16L24 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 6v36M8 16l16 10 16-10" stroke="var(--accent)" strokeWidth="1.3" opacity="0.8" />
    </svg>
  )
}

function IconField() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <rect x="10" y="8" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="22" r="7" stroke="var(--accent)" strokeWidth="1.4" />
      <path d="M17 34h14" stroke="var(--accent-2)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="22" r="2" fill="var(--accent)" />
    </svg>
  )
}
