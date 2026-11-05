FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node backend ./backend
COPY --chown=node:node frontend ./frontend
RUN mkdir -p /usr/src/app/backend/multimedia && chown -R node:node /usr/src/app/backend/multimedia

USER node

EXPOSE 3000

CMD ["node", "backend/scripts/start.js"]
