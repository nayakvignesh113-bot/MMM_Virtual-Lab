# Screenshot helper: python3 tools/shot.py <hash> <out.png> [js-before] [full]
import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': int(sys.argv[5]) if len(sys.argv) > 5 else 1280, 'height': 900})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/' + (sys.argv[6] if len(sys.argv) > 6 else 'dev.html') + '#' + sys.argv[1]); await pg.wait_for_timeout(700)
        if len(sys.argv) > 3 and sys.argv[3]: await pg.evaluate(sys.argv[3]); await pg.wait_for_timeout(900)
        await pg.screenshot(path=sys.argv[2], full_page=len(sys.argv) > 4 and sys.argv[4] == 'full'); print('errors:', errs)
        await b.close()
asyncio.run(main())
