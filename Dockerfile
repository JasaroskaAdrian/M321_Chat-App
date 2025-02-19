FROM node:22.12.0

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

COPY ./App/Client /app/Client

RUN npm run build

EXPOSE 4200

CMD ["npm", "run", "start"]