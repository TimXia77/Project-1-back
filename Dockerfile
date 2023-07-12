FROM node:alpine

COPY . /app

WORKDIR /app
RUN npm install

WORKDIR /app/main
RUN npm install

WORKDIR /app/main

EXPOSE 3000

CMD node server.js

# FROM node:alpine

# WORKDIR /app

# COPY main/package.json main/package-lock.json ./

# WORKDIR /app/main

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD node main/server.js