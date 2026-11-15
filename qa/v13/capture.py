"""Capture real app baselines; requires Python Playwright and Pillow, Chrome, HTTP server."""
import argparse, asyncio, io, json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
VIEWS = {'mobile360': (360,800), 'mobile390': (390,844), 'tablet': (800,1280), 'landscape': (1280,800)}
SUBJECTS = ['hangul','math','english','science','history','coding','finance','reading','life','creativity']

async def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--base', default='http://127.0.0.1:8000'); ap.add_argument('--chrome', default='/workspace/joiland-tools/bin/google-chrome'); args=ap.parse_args()
    out=ROOT/'docs/v13/baseline'; out.mkdir(parents=True,exist_ok=True)
    routes=[(p.stem,p.name,None) for p in sorted(ROOT.glob('*.html'))]
    routes += [('subject-'+s,'journey.html?subject='+s,None) for s in SUBJECTS]
    routes += [('story-'+str(i),'stories.html',i) for i in range(20)]
    routes += [('mini-'+s,'mini-games.html?game='+s,None) for s in ['hidden','colors','shadows','mole','differences']]
    routes += [('adventure-'+s,'adventure.html?game='+s,None) for s in ['dino','space','animal']]
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path=args.chrome,args=['--no-sandbox'],headless=True)
        for view,(width,height) in VIEWS.items():
            context=await browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
            page=await context.new_page(); thumbs=[]
            for name,route,book in routes:
                errors=[]; failed=[]
                def error(e): errors.append(str(e))
                def response(r):
                    if r.status>=400: failed.append({'url':r.url,'status':r.status})
                page.on('pageerror',error); page.on('response',response)
                await page.goto(args.base+'/'+route,wait_until='networkidle')
                if book is not None:
                    await page.locator('[data-book="'+str(book)+'"]').click()
                await page.evaluate('document.fonts.ready'); await page.wait_for_timeout(100)
                image=Image.open(io.BytesIO(await page.screenshot(full_page=True))).convert('RGB')
                image.save(out/(view+'-'+name+'.webp'),'WEBP',quality=80)
                thumb=ImageOps.contain(image,(180,290)); tile=Image.new('RGB',(200,320),'#eeeeee');tile.paste(thumb,((200-thumb.width)//2,20));ImageDraw.Draw(tile).text((5,305),name,fill='black');thumbs.append(tile)
                results.append({'view':view,'route':route,'book':book,'screenshot':view+'-'+name+'.webp','pageErrors':errors,'httpErrors':failed,'horizontalOverflow':await page.evaluate('document.documentElement.scrollWidth > innerWidth')})
                page.remove_listener('pageerror',error);page.remove_listener('response',response)
            sheet=Image.new('RGB',(1200,320*((len(thumbs)+5)//6)),'white')
            for i,t in enumerate(thumbs):sheet.paste(t,((i%6)*200,(i//6)*320))
            sheet.save(out/(view+'-contact.webp'),'WEBP',quality=85)
            await context.close()
        await browser.close()
    (out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'captures':len(results),'pageErrors':sum(len(r['pageErrors']) for r in results),'httpErrors':sum(len(r['httpErrors']) for r in results),'horizontalOverflow':sum(r['horizontalOverflow'] for r in results)}))

if __name__=='__main__':asyncio.run(main())
