import puppeteer from 'puppeteer-core'
import fs from 'fs'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--allow-insecure-localhost', '--disable-dev-shm-usage']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.setDefaultTimeout(20000)

const log = []
page.on('pageerror', (e) => log.push('PAGEERROR ' + e.message))
page.on('console', (m) => {
  if (m.type() === 'error') log.push('CONSOLE ' + m.text())
})

await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle0' })
await page.waitForSelector('.card .title')
const homeTitle = await page.title()
const cardCount = await page.$$eval('.card .title', (els) => els.length)
const firstTitle = await page.$eval('.card .title', (el) => el.textContent)
await page.screenshot({ path: 'tmp-verify/home.png', fullPage: true })

await page.click('.card .title')
await page.waitForSelector('video')
await page.waitForSelector('.watch h1')
const videoTitle = await page.$eval('.watch h1', (el) => el.textContent)
const url = page.url()
await page.screenshot({ path: 'tmp-verify/video.png', fullPage: true })

await page.click('.home')
await page.waitForSelector('.card .title')
const backCards = await page.$$eval('.card .title', (els) => els.length)
await page.screenshot({ path: 'tmp-verify/back.png' })

await browser.close()
fs.writeFileSync(
  'tmp-verify/result.json',
  JSON.stringify({ homeTitle, cardCount, firstTitle, videoTitle, url, backCards, log }, null, 2)
)
console.log(JSON.stringify({ homeTitle, cardCount, firstTitle, videoTitle, url, backCards, log }, null, 2))
