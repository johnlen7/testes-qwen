/* ÓRBITA — boot */

/* styles */
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/nav.css";
import "./styles/hero.css";
import "./styles/story.css";
import "./styles/configurator.css";
import "./styles/features.css";
import "./styles/voices.css";
import "./styles/faq.css";
import "./styles/finale.css";

/* libs */
import { initTheme } from "./lib/theme";
import { initReveal } from "./lib/reveal";

/* sections */
import { initNav } from "./sections/nav";
import { initHero } from "./sections/hero";
import { initStory } from "./sections/story";
import { initConfigurator } from "./sections/configurator";
import { initFeatures } from "./sections/features";
import { initVoices } from "./sections/voices";
import { initFaq } from "./sections/faq";
import { initFinale } from "./sections/finale";

function boot() {
  initTheme();
  initReveal();

  initNav();
  initHero();
  initStory();
  initConfigurator();
  initFeatures();
  initVoices();
  initFaq();
  initFinale();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
