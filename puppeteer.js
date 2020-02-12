const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios')

// PDFをダウンロードする関数
async function fetch(url, cookies = '') {
  const res = await axios.get(url, {
    headers: {
      Cookie: cookies,
      Accept: 'application/pdf'
    },
    responseType: 'arraybuffer'
  })
  return res.data
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 50,
  });

  const page = await browser.newPage();

  await page.goto('https://www.uluru.biz/ir/');

  // 2019.11.14のIP資料
  const img = await page.$('#dataList .irGroup dl:nth-child(1) dd a');
  const src = await img.getProperty('href');
  const targetUrl = await src.jsonValue();

  // cookieの取得
  const cookies = (await page.cookies())
        .map(c => `${c.name}=${c.value};`)
        .join(' ')

  const data = await fetch(targetUrl, cookies);

  fs.writeFileSync('./IR.pdf', new Buffer.from(data), 'binary');

  await browser.close();
})();
