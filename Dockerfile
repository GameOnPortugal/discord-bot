FROM node:15.11.0-alpine3.13 AS builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /build

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

FROM node:15.11.0-alpine3.13

RUN apk add --no-cache chromium

RUN addgroup -S appuser && adduser -S -g appuser appuser \
  && mkdir -p /home/appuser/Downloads /app \
  && chown -R appuser:appuser /home/appuser \
  && chown -R appuser:appuser /app

USER appuser

WORKDIR /app

COPY . ./

COPY --from=builder /build/node_modules/ node_modules/

COPY package.json package.json

ENTRYPOINT ["npm", "start"]
