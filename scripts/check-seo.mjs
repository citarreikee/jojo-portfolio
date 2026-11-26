import assert from 'node:assert/strict'
import {readFile,access} from 'node:fs/promises'
const sitemap=await readFile('dist/sitemap.xml','utf8')
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1])
assert.equal(urls.length,8)
for(const url of urls){
 const path=new URL(url).pathname
 const html=await readFile(`dist${path}index.html`,'utf8')
 assert.ok(html.includes(`<link rel="canonical" href="${url}"`),`canonical: ${url}`)
 assert.ok(!html.includes('noindex'),`indexability: ${url}`)
 assert.ok(html.includes('<h1'),`heading: ${url}`)
 assert.ok(!/Show review notes|REVIEW NOTE|revision-toggle/.test(html),'review UI removed')
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]))
 assert.ok(schemas.length,`structured data: ${url}`)
 for(const [,target] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){
  await access('dist'+target+(target.endsWith('/')?'index.html':''))
 }
}
const home=await readFile('dist/index.html','utf8')
assert.ok(home.includes('I build AI that reaches beyond the screen'))
assert.ok(home.includes('mailto:citarreikee@gmail.com'))
assert.ok(home.includes('/notes/'))
const robots=await readFile('dist/robots.txt','utf8')
assert.ok(robots.includes('Sitemap: https://jojo.entropyfield.com/sitemap.xml'))
console.log('SEO checks passed: 8 static pages, canonical URLs, indexability, structured data, local links and no review controls.')
