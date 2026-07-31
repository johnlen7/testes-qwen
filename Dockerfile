# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /vitrine

# Git aparece em alguns lockfiles como origem de dependência.
RUN apk add --no-cache git

COPY package.json projects.json build.mjs verify.mjs ./
COPY lib ./lib
COPY hub ./hub
COPY apps ./apps

RUN node build.mjs && node verify.mjs

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /vitrine/site /usr/share/nginx/html
EXPOSE 80
