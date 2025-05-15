import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const startUrls = ['https://www.zillow.com/homes/for_sale/Stratford-CT/'];

const crawler = new PuppeteerCrawler({
  async requestHandler({ page, request, log }) {
    log.info(`Processing ${request.url}`);

    // Wait for the listings to load
    await page.waitForSelector('article.list-card');

    // Extract data
    const listings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article.list-card')).map(card => ({
        title: card.querySelector('address')?.innerText || '',
        price: card.querySelector('.list-card-price')?.innerText || '',
        link: card.querySelector('a')?.href || ''
      }));
    });

    // Push data to dataset
    for (const listing of listings) {
      await Actor.pushData(listing);
    }
  }
});

await crawler.run(startUrls);

await Actor.exit();
