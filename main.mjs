import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

// Pulls the provided Zillow listing URL from Apify's input panel
const { listingUrl } = await Actor.getInput();

// Correctly wrap the URL in an object as required by Crawlee
const startUrls = [{ url: listingUrl }];

const crawler = new PuppeteerCrawler({
    async requestHandler({ page, request, log }) {
        log.info(`Processing ${request.url}`);

        await page.waitForSelector('main');

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
                description: getText('div[data-testid="home-description"]'),
                features: getAllTexts('ul[data-testid="home-features-list"] li'),
                images: getAllSrcs('ul[data-testid="media-stream"] img'),
                priceHistory: getAllTexts('section[data-testid="price-history"] table'),
                taxHistory: getAllTexts('section[data-testid="tax-history"] table'),
                nearbySchools: getAllTexts('section[data-testid="nearby-schools"]')
            };
        });

        await Actor.pushData(data);
    }
});

await crawler.run(startUrls);
await Actor.exit();
