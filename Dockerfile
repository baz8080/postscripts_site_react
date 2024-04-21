# Use the official Node.js 20.12.1 image as base
FROM node:20.12.1

# Set the working directory inside the container
WORKDIR /home/node/code/podscripts_site_react

COPY package*.json ./
COPY build ./build/
COPY .env ./.env

# Install dependencies
RUN npm install --production