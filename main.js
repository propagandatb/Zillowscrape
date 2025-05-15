import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const startUrls = ['https://www.zillow.com/homes/for_sale/Stratford-CT'];

const crawler = new PuppeteerCrawler({
    async requestHandler({ page, request, log }) {
        log.info(`Processing ${request.url}`);

        await page.waitForSelector('.photo-cards');

        const listings = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.list-card-info')).map(card => ({
                title: card.querySelector('.list-card-heading')?.innerText,
                price: card.querySelector('.list-card-price')?.innerText,
                link: card.querySelector('a')?.href,
            }));
        });

        for (const listing of listings) {
            console.log(listing);
            await Actor.pushData(listing);
        }
    },
});

await crawler.run(startUrls);
await Actor.exit();
