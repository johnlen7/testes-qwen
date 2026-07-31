import { ConfiguratorProvider } from './state/ConfiguratorContext'
import { Nav } from './components/Nav'
import { Hero } from './components/sections/Hero'
import { ScrollStory } from './components/sections/ScrollStory'
import { Configurator } from './components/sections/Configurator'
import { Features } from './components/sections/Features'
import { Testimonials } from './components/sections/Testimonials'
import { Faq } from './components/sections/Faq'
import { FinalCta } from './components/sections/FinalCta'
import { Footer } from './components/sections/Footer'

export default function App() {
  return (
    <ConfiguratorProvider>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Nav />
      <main id="conteudo">
        <Hero />
        <ScrollStory />
        <Configurator />
        <Features />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </ConfiguratorProvider>
  )
}
