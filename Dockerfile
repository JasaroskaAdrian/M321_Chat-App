FROM node:18

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules package-lock.json && npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 4200

CMD ["npm", "run", "dev"]