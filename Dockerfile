FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node . .
RUN mkdir -p /usr/src/app/src/multimedia && chown -R node:node /usr/src/app/src/multimedia

USER node

EXPOSE 3000

CMD ["node", "scripts/start.js"]
