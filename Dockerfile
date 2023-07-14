FROM node:alpine

COPY . /app/api

WORKDIR /app/api
RUN npm install --include=dev

WORKDIR /app/api/main
RUN npm install --include=dev

WORKDIR /app/api/main

EXPOSE 3000

CMD node server.js

#RUN apk add --no-cache --virtual .gyp python make g++
#RUN npm rebuild bcrypt --build-from-source
