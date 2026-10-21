import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(body="", content_type="text/css"))
        await pg.goto("http://localhost:8765/?v=lines")
        lines = await pg.evaluate("window.__belongLines()")
        json.dump(lines, open("lines.json","w"), indent=1, ensure_ascii=False)
        print(len(lines), "lines,", sum(len(l["text"]) for l in lines), "chars")
        await b.close()
asyncio.run(main())
