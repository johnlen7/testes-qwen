import re
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)
BASE_URL = os.environ.get("ORBITA_URL", "http://127.0.0.1:4173")


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="no-preference", color_scheme="dark")
        page = context.new_page()
        page.goto(BASE_URL, wait_until="networkidle")

        assert page.title() == "ÓRBITA | Som espacial"
        assert page.locator("main#main-content").count() == 1
        assert page.locator("section").count() >= 7
        assert page.locator("svg.product-visual").count() >= 4
        ids = page.locator("[id]").evaluate_all("elements => elements.map(element => element.id).filter(Boolean)")
        assert len(ids) == len(set(ids))
        inactive_step_opacity = page.locator('.story-step').nth(1).evaluate("element => getComputedStyle(element).opacity")
        assert float(inactive_step_opacity) >= 0.99
        for option in page.locator('.attribute-option').all():
            assert option.get_attribute('aria-label') is None
            assert option.get_attribute('aria-describedby')

        page.screenshot(path=str(ARTIFACTS / "orbita-1280.png"), full_page=True)
        page.evaluate("""
            () => {
              const section = document.querySelector('.story-section');
              document.documentElement.style.scrollBehavior = 'auto';
              if (section) window.scrollTo(0, section.offsetTop + section.offsetHeight * 0.48);
            }
        """)
        page.wait_for_timeout(180)
        progress = page.locator('.story-section').evaluate("element => parseFloat(getComputedStyle(element).getPropertyValue('--story-progress'))")
        separation = page.locator('.story-section').evaluate("element => parseFloat(getComputedStyle(element).getPropertyValue('--story-separation'))")
        assert 0.2 < progress < 0.8
        assert separation > 0.4
        page.evaluate("""
            () => {
              const section = document.querySelector('.story-section');
              if (!section) return;
              window.scrollTo(0, section.offsetTop + section.offsetHeight * 0.12);
            }
        """)
        page.wait_for_timeout(100)
        closed_x = page.locator('.story-visual .product-visual__earcup--left').bounding_box()['x']
        page.evaluate("""
            () => {
              const section = document.querySelector('.story-section');
              if (!section) return;
              window.scrollTo(0, section.offsetTop + section.offsetHeight * 0.5);
            }
        """)
        page.wait_for_timeout(100)
        separated_x = page.locator('.story-visual .product-visual__earcup--left').bounding_box()['x']
        assert abs(separated_x - closed_x) > 12
        page.screenshot(path=str(ARTIFACTS / "orbita-story-mid.png"), full_page=False)
        page.locator('.features-section').scroll_into_view_if_needed()
        page.wait_for_timeout(180)
        page.screenshot(path=str(ARTIFACTS / "orbita-features.png"), full_page=False)
        page.evaluate("window.scrollTo(0, 0)")

        color_button = page.get_by_role("button", name=re.compile("Ember"))
        color_button.click()
        config_product = page.locator(".configurator-visual .product-visual")
        page.wait_for_timeout(80)
        mid_shell = config_product.evaluate("element => getComputedStyle(element).getPropertyValue('--orbita-shell').trim()")
        page.wait_for_timeout(620)
        final_shell = config_product.evaluate("element => getComputedStyle(element).getPropertyValue('--orbita-shell').trim()")
        assert mid_shell != final_shell
        attribute_button = page.get_by_role("button", name=re.compile("Open air"))
        attribute_button.click()
        page.wait_for_timeout(700)
        assert page.get_by_role("button", name=re.compile(r"Comprar ÓRBITA - Ember, R\$ 2\.819")).count() == 1
        page.get_by_role("button", name=re.compile(r"Comprar ÓRBITA - Ember, R\$ 2\.819")).click()
        assert page.locator(".purchase-status").count() == 1

        pause_button = page.get_by_role("button", name="Pausar depoimentos")
        pause_button.click()
        assert page.get_by_role("button", name="Retomar depoimentos").get_attribute("aria-pressed") == "true"
        page.get_by_role("button", name="Retomar depoimentos").click()

        faq = page.get_by_role("button", name="O cancelamento funciona em ambientes diferentes?")
        faq.press("Enter")
        assert faq.get_attribute("aria-expanded") == "false"
        assert page.locator("#faq-panel-noise").get_attribute("aria-hidden") == "true"
        faq.press("Enter")
        assert faq.get_attribute("aria-expanded") == "true"
        faq.press("ArrowDown")
        assert page.get_by_role("button", name="Como o ÓRBITA se comporta depois de algumas horas?").evaluate("el => document.activeElement === el")

        assert page.locator(".testimonial-card[aria-hidden='true']").count() == len([1, 2, 3, 4])
        assert page.locator(".price-line strong[aria-hidden='true']").count() == 1
        assert page.locator(".price-line [role='status']").count() == 1

        theme_toggle = page.get_by_role("button", name="Ativar tema claro")
        theme_toggle.click()
        page.wait_for_timeout(800)
        assert page.locator("html[data-theme='light']").count() == 1
        page.screenshot(path=str(ARTIFACTS / "orbita-light.png"), full_page=False)
        page.get_by_role("button", name="Ativar tema escuro").click()
        page.wait_for_timeout(800)
        assert page.locator("html[data-theme='dark']").count() == 1

        mobile = browser.new_context(viewport={"width": 360, "height": 800}, reduced_motion="no-preference", color_scheme="dark")
        mobile_page = mobile.new_page()
        mobile_page.goto(BASE_URL, wait_until="networkidle")
        assert mobile_page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        assert mobile_page.evaluate("document.body.scrollWidth <= window.innerWidth")
        assert mobile_page.get_by_role("navigation", name="Navegação principal").get_by_role("link", name="Configurar").is_visible()
        mobile_page.screenshot(path=str(ARTIFACTS / "orbita-360.png"), full_page=True)

        reduced = browser.new_context(viewport={"width": 768, "height": 800}, reduced_motion="reduce", color_scheme="dark")
        reduced_page = reduced.new_page()
        reduced_page.goto(BASE_URL, wait_until="networkidle")
        assert reduced_page.evaluate("window.matchMedia('(prefers-reduced-motion: reduce)').matches")
        assert reduced_page.locator(".product-visual__orbit--primary").count() > 0
        assert reduced_page.locator(".product-visual__orbit--primary").first.evaluate("element => getComputedStyle(element).animationName") == "none"
        assert reduced_page.locator(".product-visual__orbit--secondary").first.evaluate("element => getComputedStyle(element).animationName") == "none"
        assert reduced_page.request.get(f"{BASE_URL}/favicon.svg").status == 200

        mobile.close()
        reduced.close()
        context.close()
        browser.close()
    print("ORBÍTA browser verification passed")


if __name__ == "__main__":
    main()
