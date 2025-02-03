FROM node:18.17.1-alpine
WORKDIR /app/
COPY package*.json /app/
RUN npm ci
COPY . /app/
CMD ["npm", "run", "start"]