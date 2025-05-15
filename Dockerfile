FROM apify/actor-node-puppeteer-chrome:latest

COPY package*.json ./

RUN npm install --omit=dev --omit=optional

COPY . ./

CMD npm start
