"""QA visual do ÓRBITA — screenshots das seções + erros de console."""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), 'shots')
os.makedirs(OUT, exist_ok=True)

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # ---- desktop 1280 ----
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://localhost:4321')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1800)
    page.screenshot(path=f'{OUT}/01-hero.png')

    # scroll-telling: 3 pontos do scrub
    story = page.locator('.story')
    top = story.evaluate('(el) => el.offsetTop')
    h = story.evaluate('(el) => el.offsetHeight')
    for i, frac in enumerate([0.1, 0.35, 0.62, 0.9]):
        page.evaluate(f'window.scrollTo(0, {top + (h - 800) * frac})')
        page.wait_for_timeout(400)
        page.screenshot(path=f'{OUT}/02-story-{i}.png')

    for name, sel in [
        ('03-configurador', '#configurador'),
        ('04-features', '#recursos'),
        ('05-depoimentos', '.quotes'),
        ('06-faq', '#faq'),
        ('07-finale', '.finale'),
    ]:
        page.locator(sel).scroll_into_view_if_needed()
        page.wait_for_timeout(900)
        page.screenshot(path=f'{OUT}/{name}.png')

    # interações: trocar cor + concha no configurador
    page.locator('#configurador').scroll_into_view_if_needed()
    page.wait_for_timeout(400)
    page.locator('input[name="cor"][value="solar"]').check(force=True)
    page.locator('input[name="concha"][value="ampla"]').check(force=True)
    page.wait_for_timeout(900)
    page.screenshot(path=f'{OUT}/08-config-solar.png')
    cta_txt = page.locator('[data-cta]').inner_text()
    print('CTA configurador:', cta_txt)

    # FAQ aberto
    page.locator('#faq-btn-0').click()
    page.wait_for_timeout(700)
    page.locator('#faq').scroll_into_view_if_needed()
    page.screenshot(path=f'{OUT}/09-faq-aberto.png')
    print('FAQ aria-expanded:', page.locator('#faq-btn-0').get_attribute('aria-expanded'))

    # CTA final refletindo o estado
    page.locator('.finale').scroll_into_view_if_needed()
    page.wait_for_timeout(900)
    page.screenshot(path=f'{OUT}/10-finale-solar.png')
    print('CTA final:', page.locator('[data-finale-label]').inner_text())

    # tema claro
    page.locator('[data-theme-toggle]').click()
    page.wait_for_timeout(1200)
    page.evaluate('window.scrollTo(0, 0)')
    page.wait_for_timeout(900)
    page.screenshot(path=f'{OUT}/11-light-hero.png')
    page.locator('#configurador').scroll_into_view_if_needed()
    page.wait_for_timeout(600)
    page.screenshot(path=f'{OUT}/12-light-config.png')

    # ---- mobile 360 ----
    mob = browser.new_page(viewport={'width': 360, 'height': 780})
    mob.on('console', lambda m: errors.append('[mob] ' + m.text) if m.type == 'error' else None)
    mob.on('pageerror', lambda e: errors.append('[mob] ' + str(e)))
    mob.goto('http://localhost:4321')
    mob.wait_for_load_state('networkidle')
    mob.wait_for_timeout(1500)
    mob.screenshot(path=f'{OUT}/13-mob-hero.png')
    mob.locator('#configurador').scroll_into_view_if_needed()
    mob.wait_for_timeout(800)
    mob.screenshot(path=f'{OUT}/14-mob-config.png')
    mob.locator('#faq').scroll_into_view_if_needed()
    mob.wait_for_timeout(600)
    mob.screenshot(path=f'{OUT}/15-mob-faq.png')

    browser.close()

print('CONSOLE ERRORS:', len(errors))
for e in errors[:20]:
    print(' -', e[:200])
