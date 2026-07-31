// ÓRBITA · bootstrap

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/scrolltell.css";
import "./styles/configurator.css";
import "./styles/features.css";
import "./styles/marquee.css";
import "./styles/faq.css";
import "./styles/cta.css";

import { mountAllHeadphones } from "./lib/headphone";
import { initTheme } from "./lib/theme";
import { initMagnetic } from "./lib/magnetic";
import { initHero } from "./sections/hero";
import { initScrolltell } from "./sections/scrolltell";
import { initConfigurator } from "./sections/configurator";
import { initFeatures } from "./sections/features";
import { initMarquee } from "./sections/marquee";
import { initFaq } from "./sections/faq";
import { initCta } from "./sections/cta";

function boot(): void {
  mountAllHeadphones();
  initTheme();
  initMagnetic();
  initHero();
  initScrolltell();
  initConfigurator();
  initFeatures();
  initMarquee();
  initFaq();
  initCta();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
