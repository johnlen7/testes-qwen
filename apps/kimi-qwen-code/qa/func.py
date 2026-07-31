"""QA funcional do ÓRBITA — asserções de DOM/computed style."""
from playwright.sync_api import sync_playwright

fails = []

def check(nome, cond, extra=''):
    print(('PASS' if cond else 'FAIL'), '-', nome, extra)
    if not cond:
        fails.append(nome)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://localhost:4321')
    page.wait_for_load_state('networkidle')

    # 1. Hero: entrada orquestrada concluída
    page.wait_for_timeout(2200)
    op = page.locator('.hero__title .line > span').first.evaluate('(el) => getComputedStyle(el).opacity')
    check('hero: título revelado', float(op) > 0.95)
    moving = page.locator('.hero__ring--1').evaluate('(el) => getComputedStyle(el).animationName')
    check('hero: anel com movimento contínuo', moving != 'none')

    # 2. Story: scrubbing — explode no meio, texto sincronizado
    top = page.locator('.story').evaluate('(el) => el.offsetTop')
    h = page.locator('.story').evaluate('(el) => el.offsetHeight')
    page.evaluate(f'window.scrollTo({{top: {top + (h - 800) * 0.33}, behavior: "instant"}})')
    page.wait_for_timeout(400)
    band = page.locator('.story [data-part="band"]').evaluate('(el) => el.style.transform')
    check('story: explode aplica transform (scrub)', 'translate' in band and band != 'translate(0.0px, 0.0px) rotate(0.00deg)', band)
    op2 = float(page.locator('.story__step').nth(1).evaluate('(el) => el.style.opacity'))
    op1 = float(page.locator('.story__step').nth(0).evaluate('(el) => el.style.opacity'))
    check('story: etapa 2 visível, etapa 1 oculta', op2 > 0.8 and op1 < 0.2, f'op1={op1:.2f} op2={op2:.2f}')
    rail = page.locator('.story__rail-fill').evaluate('(el) => el.style.transform')
    check('story: rail de progresso mapeado', 'scaleY(0.3' in rail or 'scaleY(0.4' in rail, rail)
    # remontagem no fim
    page.evaluate(f'window.scrollTo({{top: {top + (h - 800) * 0.99}, behavior: "instant"}})')
    page.wait_for_timeout(400)
    band2 = page.locator('.story [data-part="band"]').evaluate('(el) => el.style.transform')
    import re
    m = re.match(r'translate\((-?[\d.]+)px, (-?[\d.]+)px\) rotate\((-?[\d.]+)deg\)', band2)
    ok = m and abs(float(m.group(1))) < 1 and abs(float(m.group(2))) <= 7 and abs(float(m.group(3))) < 1
    check('story: remontagem zera explode (± flutuação contínua)', bool(ok), band2)

    # 3. Configurador: count-up + CTA
    page.locator('#configurador').scroll_into_view_if_needed()
    norm = lambda s: s.replace('\xa0', ' ')
    before = norm(page.locator('[data-preco]').inner_text())
    page.locator('input[name="cor"][value="solar"]').check(force=True)
    page.wait_for_timeout(120)
    mid = norm(page.locator('[data-preco]').inner_text())
    page.wait_for_timeout(900)
    after = norm(page.locator('[data-preco]').inner_text())
    check('config: count-up anima preço', before != after and after == 'R$ 2.649', f'{before} -> {mid} -> {after}')
    scale = page.locator('.cfg .o-cup-group').evaluate('(el) => el.style.transform')
    page.locator('input[name="concha"][value="ampla"]').check(force=True)
    page.wait_for_timeout(200)
    scale2 = page.locator('.cfg .o-cup-group').evaluate('(el) => el.style.transform')
    check('config: concha altera visual', scale != scale2 and '1.08' in scale2, scale2)
    cup = page.locator('.cfg .orbita-svg').evaluate('(el) => el.style.getPropertyValue("--cup")')
    check('config: cor solar no SVG', cup == '#ff4d24', cup)

    # 4. Features: stagger reveal
    page.locator('#recursos').scroll_into_view_if_needed()
    page.wait_for_timeout(900)
    inn = page.locator('.features__card').first.evaluate('(el) => el.classList.contains("is-in")')
    check('features: reveal por scroll', inn)

    # 5. Marquee: move sozinho e pausa em hover
    page.locator('.quotes').scroll_into_view_if_needed()
    # garante que o ponteiro não está sobre o marquee (scroll pode gerar pointerenter)
    page.mouse.move(20, 20)
    page.locator('.marquee').evaluate('(el) => el.dispatchEvent(new PointerEvent("pointerleave"))')
    page.wait_for_timeout(1500)
    t1 = page.locator('.marquee__track').evaluate('(el) => el.style.transform')
    page.wait_for_timeout(600)
    t2 = page.locator('.marquee__track').evaluate('(el) => el.style.transform')
    check('marquee: loop automático', t1 != t2, f'{t1} -> {t2}')
    page.locator('.marquee').hover()
    t3 = page.locator('.marquee__track').evaluate('(el) => el.style.transform')
    page.wait_for_timeout(400)
    t4 = page.locator('.marquee__track').evaluate('(el) => el.style.transform')
    check('marquee: pausa em hover', t3 == t4)

    # 6. FAQ: teclado + aria
    page.locator('#faq-btn-0').focus()
    page.keyboard.press('Enter')
    page.wait_for_timeout(200)
    check('faq: Enter abre', page.locator('#faq-btn-0').get_attribute('aria-expanded') == 'true')
    rows = page.locator('#faq-panel-0').evaluate('(el) => getComputedStyle(el).gridTemplateRows')
    check('faq: altura animada via grid-rows', rows not in ('0fr', '0px'), rows)
    page.keyboard.press('ArrowDown')
    check('faq: seta navega', page.evaluate('document.activeElement.id') == 'faq-btn-1')
    page.keyboard.press('Enter')
    page.wait_for_timeout(200)
    check('faq: abre segundo item', page.locator('#faq-btn-1').get_attribute('aria-expanded') == 'true')

    # 7. Tema: toggle + persistência
    initial = page.evaluate('document.documentElement.dataset.theme')
    expected = 'light' if initial == 'dark' else 'dark'
    page.locator('[data-theme-toggle]').click()
    page.wait_for_timeout(1100)
    theme = page.evaluate('document.documentElement.dataset.theme')
    stored = page.evaluate('localStorage.getItem("orbita-theme")')
    check('tema: toggle inverte o tema', theme == expected and stored == expected, f'{initial} -> {theme}/{stored}')
    page.reload()
    page.wait_for_load_state('networkidle')
    theme2 = page.evaluate('document.documentElement.dataset.theme')
    check('tema: persiste após reload', theme2 == expected)

    # 8. prefers-color-scheme como padrão (nova página, sem storage)
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, color_scheme='light')
    pg2 = ctx.new_page()
    pg2.goto('http://localhost:4321')
    pg2.wait_for_load_state('networkidle')
    t = pg2.evaluate('document.documentElement.dataset.theme')
    check('tema: respeita prefers-color-scheme', t == 'light', t)
    ctx.close()

    # 9. Reduced motion
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, reduced_motion='reduce')
    pg3 = ctx.new_page()
    pg3.goto('http://localhost:4321')
    pg3.wait_for_load_state('networkidle')
    anim = pg3.locator('.hero__ring--1').evaluate('(el) => getComputedStyle(el).animationDuration')
    check('reduced-motion: anéis parados', anim in ('0.01ms', '0s', '1e-05s'), anim)
    rv_op = pg3.locator('.features__card').first.evaluate('(el) => getComputedStyle(el).opacity')
    check('reduced-motion: reveals visíveis', float(rv_op) == 1.0, rv_op)
    story_h = pg3.locator('.story').evaluate('(el) => getComputedStyle(el).height')
    story_pos = pg3.locator('.story__sticky').evaluate('(el) => getComputedStyle(el).position')
    check('reduced-motion: story vira conteúdo estático', story_pos == 'static', story_pos)
    ctx.close()

    # 10. Mobile 360: sem scroll horizontal
    mob = browser.new_page(viewport={'width': 360, 'height': 780})
    mob.goto('http://localhost:4321')
    mob.wait_for_load_state('networkidle')
    mob.wait_for_timeout(1500)
    sw = mob.evaluate('document.documentElement.scrollWidth')
    check('mobile 360: sem overflow horizontal', sw <= 361, f'scrollWidth={sw}')

    # 11. Tablet 768: sem scroll horizontal
    tab = browser.new_page(viewport={'width': 768, 'height': 1024})
    tab.goto('http://localhost:4321')
    tab.wait_for_load_state('networkidle')
    tab.wait_for_timeout(1500)
    sw = tab.evaluate('document.documentElement.scrollWidth')
    check('tablet 768: sem overflow horizontal', sw <= 769, f'scrollWidth={sw}')

    print('PAGEERRORS:', errors)
    browser.close()

print()
print('TOTAL FAILS:', len(fails), fails)
