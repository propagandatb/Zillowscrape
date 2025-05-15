import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const startUrls = ['https://www.zillow.com/homedetails/70-Ruby-Ln-Stratford-CT-06614/58752170_zpid/'];

const crawler = new PuppeteerCrawler({
  async requestHandler({ page, request, log }) {
    log.info(`Processing ${request.url}`);

    // Wait for the main content to load
    await page.waitForSelector('main');

    // Extract data
    const data = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText || '';
      const getAllTexts = (selector) => Array.from(document.querySelectorAll(selector)).map(el => el.innerText);
      const getAllSrcs = (selector) => Array.from(document.querySelectorAll(selector)).map(el => el.src);

      return {
        address: getText('h1[data-testid="home-details-summary-headline"]'),
        price: getText('span[data-testid="price"]'),
        beds: getText('span[data-testid="bed-bath-beyond-bedroom"]'),
        baths: getText('span[data-testid="bed-bath-beyond-bathroom"]'),
        sqft: getText('span[data-testid="bed-bath-beyond-floor-space"]'),
        description: getText('div[data-testid="home-description-text"]'),
        features: getAllTexts('ul[data-testid="home-features-list"] li'),
        images: getAllSrcs('ul[data-testid="media-stream"] img'),
        priceHistory: getAllTexts('section[data-testid="price-history"] table tbody tr'),
        taxHistory: getAllTexts('section[data-testid="tax-history"] table tbody tr'),
        nearbySchools: getAllTexts('section[data-testid="nearby-schools"] table tbody tr')
      };
    });

    await Actor.pushData(data);
  }
});

await crawler.run(startUrls);

await Actor.exit();

