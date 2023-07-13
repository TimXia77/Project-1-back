FROM node:alpine

COPY . /app/api

WORKDIR /app/api
RUN npm install

WORKDIR /app/api/main
RUN npm install

WORKDIR /app/api/main

EXPOSE 3000

CMD node server.js

