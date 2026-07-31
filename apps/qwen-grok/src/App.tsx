import { ConfigProvider } from './context/ConfigContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ScrollStory } from './components/ScrollStory'
import { Configurator } from './components/Configurator'
import { Features } from './components/Features'
import { Testimonials } from './components/Testimonials'
import { FAQ } from './components/FAQ'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <ConfigProvider>
      <a className="skip-link" href="#topo">
        Ir para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <ScrollStory />
        <Configurator />
        <Features />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </ConfigProvider>
  )
}
