import { ThemeProvider } from './contexts/ThemeContext';
import { ProductProvider } from './contexts/ProductContext';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import ScrollTelling from './components/ScrollTelling/ScrollTelling';
import Configurator from './components/Configurator/Configurator';
import Features from './components/Features/Features';
import Testimonials from './components/Testimonials/Testimonials';
import Faq from './components/Faq/Faq';
import FinalCta from './components/FinalCta/FinalCta';
import Footer from './components/Footer/Footer';

export default function App() {
  return (
    <ThemeProvider>
      <ProductProvider>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo">
          <Hero />
          <ScrollTelling />
          <Configurator />
          <Features />
          <Testimonials />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </ProductProvider>
    </ThemeProvider>
  );
}
