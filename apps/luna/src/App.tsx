import { useMemo, useState } from 'react';
import { Configurator } from './components/Configurator';
import { FAQ } from './components/FAQ';
import { FeatureGrid } from './components/FeatureGrid';
import { FinalCTA } from './components/FinalCTA';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { TestimonialRail } from './components/TestimonialRail';
import { productCatalog, features, faqs, testimonials } from './data/content';
import { useTheme } from './hooks/useTheme';
import type { ProductSelection } from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [selection, setSelection] = useState<ProductSelection>({ colorId: 'graphite', attributeId: 'spatial' });

  const color = productCatalog.colors.find((item) => item.id === selection.colorId) ?? productCatalog.colors[0];
  const attribute = productCatalog.attributes.find((item) => item.id === selection.attributeId) ?? productCatalog.attributes[0];
  const price = useMemo(() => productCatalog.basePrice + color.priceDelta + attribute.priceDelta, [attribute.priceDelta, color.priceDelta]);

  return (
    <div className="page-shell" id="top">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content">
        <Hero color={color} attribute={attribute} />
        <StorySection color={color} attribute={attribute} />
        <Configurator
          selection={selection}
          colors={productCatalog.colors}
          attributes={productCatalog.attributes}
          price={price}
          onColorChange={(colorId) => setSelection((current) => ({ ...current, colorId }))}
          onAttributeChange={(attributeId) => setSelection((current) => ({ ...current, attributeId }))}
        />
        <FeatureGrid features={features} />
        <TestimonialRail testimonials={testimonials} />
        <FAQ items={faqs} />
        <FinalCTA color={color} attribute={attribute} price={price} />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="footer-copy">ÓRBITA / som espacial / 2026</p>
          <div className="footer-links">
            <a href="#top">Início</a>
            <a href="#configurador">Configurar</a>
            <a href="#duvidas">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
